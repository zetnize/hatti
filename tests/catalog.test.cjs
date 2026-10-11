require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const sharp = require("sharp");
const { products, initialCategories } = require("../data/products.ts");
const { parseProductInput } = require("../lib/catalog.ts");
const { parsePrice } = require("../lib/catalog-validation.ts");
const { validateProductOrder } = require("../lib/catalog-order.ts");
const { normalizeProduct, priceLabel, discountPercent } = require("../lib/product-display.ts");
const { optimizeProductImage } = require("../lib/image-upload.ts");
const input = () => ({ ...products[0] });

test("old covers survive normalization; explicit empty galleries remain empty", () => {
  const normalized = normalizeProduct(products[0], 7);
  assert.equal(normalized.images[0].src, products[0].image);
  assert.equal(normalized.sort_order, 7);
  assert.equal(normalized.show_price, true);
  assert.equal(normalizeProduct({ ...products[0], images: [] }, 0).image, "");
});

test("gallery limits, paths, duplicates, alt and cover are validated", () => {
  const second = { src: products[1].image, alt: "Вид сзади" };
  const parsed = parseProductInput({ ...input(), images: [second] }, initialCategories);
  assert.equal(parsed.image, second.src);
  assert.equal(parsed.images[0].alt, second.alt);
  assert.equal(parseProductInput({ ...input(), images: [] }, initialCategories).image, "");
  assert.equal(parseProductInput(input(), initialCategories).images[0].src, products[0].image);
  for (const images of [Array(11).fill(second), [second, second], [{ src: "https://evil.test/image.png" }], [{ src: "/api/media/../../secret.png" }], [{ ...second, alt: "a".repeat(201) }]]) {
    assert.throws(() => parseProductInput({ ...input(), images }, initialCategories));
  }
});

test("prices reject non-numeric, non-positive, overflow and excess precision", () => {
  for (const value of [0, -1, "1e3", "Infinity", true, [], {}, " ", "12.345", "1000000000000"]) assert.throws(() => parsePrice(value, "Цена"));
  assert.equal(parsePrice("12500.50", "Цена"), 12500.5);
  assert.equal(parsePrice("", "Цена"), null);
  assert.throws(() => parseProductInput({ ...input(), currency: "XXX" }, initialCategories));
  for (const currency of ["USD", "EUR", "TRY"]) assert.throws(() => parseProductInput({ ...input(), currency }, initialCategories), /только в рублях/);
  assert.equal(parseProductInput(input(), initialCategories).currency, "RUB");
  assert.throws(() => parseProductInput({ ...input(), show_price: "false" }, initialCategories));
  const product = { ...products[0], price: 12500, old_price: 15000, currency: "RUB", price_from: true };
  assert.equal(priceLabel(product).replace(/\s/g, " "), "от 12 500 ₽");
  assert.equal(priceLabel({ ...product, currency: "EUR" }).replace(/\s/g, " "), "от 12 500 ₽");
  assert.equal(discountPercent(product), 17);
  assert.equal(discountPercent({ ...product, old_price: 10000 }), 0);
  assert.equal(priceLabel({ ...product, show_price: false }), "");
});

test("order rejects stale, missing, repeated and unknown ids", () => {
  assert.deepEqual(validateProductOrder([2, 1], products.slice(0, 2)), [2, 1]);
  for (const value of [[1], [1, 1], [1, 3], ["1", 2], null]) assert.throws(() => validateProductOrder(value, products.slice(0, 2)));
});

test("uploads decode, resize and strip metadata, rejecting impostors and truncation", async () => {
  const png = await sharp({ create: { width: 2000, height: 1000, channels: 4, background: "#336633" } }).png().toBuffer();
  const output = await optimizeProductImage(new File([png], "photo.png", { type: "image/png" }));
  const meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp"); assert.equal(meta.width, 1600); assert.equal(meta.height, 800); assert.equal(meta.exif, undefined);
  for (const file of [new File(["bad"], "photo.png", { type: "image/png" }), new File([png], "photo.jpg", { type: "image/jpeg" }), new File([png.subarray(0, 60)], "photo.png", { type: "image/png" }), new File([Buffer.alloc(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })]) {
    await assert.rejects(optimizeProductImage(file));
  }
});

test("local migration and concurrent creates preserve data, ordering and gallery", async () => {
  const originalDirectory = process.cwd();
  const originalDatabase = process.env.DATABASE_URL;
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "hatti-catalog-test-"));
  process.chdir(temporary); process.env.DATABASE_URL = "";
  try {
    await fs.mkdir(path.join(temporary, ".data"));
    await fs.writeFile(path.join(temporary, ".data", "products.json"), JSON.stringify(products.slice(0, 3)));
    delete require.cache[require.resolve("../lib/catalog.ts")];
    const catalog = require("../lib/catalog.ts");
    let current = await catalog.readProducts();
    assert.deepEqual(current.map((p) => p.images[0].src), products.slice(0, 3).map((p) => p.image));
    await catalog.reorderProducts([3, 1, 2]);
    const edits = catalog.parseProductInput({ ...input(), images: [{ src: products[1].image, alt: "Обложка" }], price: "12500" }, initialCategories);
    await catalog.saveProduct(1, edits);
    await Promise.all([catalog.createProduct(edits), catalog.createProduct(edits)]);
    current = await catalog.readProducts();
    assert.deepEqual(current.map((p) => p.id), [3, 1, 2, 4, 5]);
    assert.equal(current[1].price, 12500);
    assert.equal(current[1].image, products[1].image);
    assert.equal(new Set(current.map((p) => p.sort_order)).size, 5);
    const before = await fs.readFile(path.join(temporary, ".data", "products.json"), "utf8");
    await assert.rejects(catalog.reorderProducts([3, 1, 2]));
    assert.equal(await fs.readFile(path.join(temporary, ".data", "products.json"), "utf8"), before);
  } finally {
    process.chdir(originalDirectory);
    if (originalDatabase === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = originalDatabase;
    // Only the mkdtemp directory created by this test is removed.
    if (path.dirname(temporary) === os.tmpdir() && path.basename(temporary).startsWith("hatti-catalog-test-")) await fs.rm(temporary, { recursive: true });
  }
});
