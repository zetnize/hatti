import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { initialCategories, products as initialProducts, type Product } from "@/data/products";
import { databaseCategories, databaseConfigured, databaseCreateCategory, databaseCreateProduct, databaseDeleteCategory, databaseDeleteProduct, databaseProducts, databaseRenameCategory, databaseSaveProduct } from "@/lib/database";
import { CatalogInputError } from "@/lib/catalog-errors";

const catalogDirectory = path.join(process.cwd(), ".data");
const catalogFile = path.join(catalogDirectory, "products.json");
const categoriesFile = path.join(catalogDirectory, "categories.json");

export type ProductInput = Omit<Product, "id" | "slug">;
export { CatalogInputError } from "@/lib/catalog-errors";

export async function readProducts(): Promise<Product[]> {
  if (databaseConfigured()) return databaseProducts();
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  try {
    const stored = JSON.parse(await readFile(catalogFile, "utf8"));
    return Array.isArray(stored) ? stored as Product[] : initialProducts;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return initialProducts;
    throw error;
  }
}

export async function readCategories(): Promise<string[]> {
  if (databaseConfigured()) return databaseCategories();
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  try {
    const stored: unknown = JSON.parse(await readFile(categoriesFile, "utf8"));
    if (!Array.isArray(stored) || stored.some((item) => typeof item !== "string")) throw new Error("Invalid categories file.");
    return stored;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return [...new Set([...initialCategories, ...(await readProducts()).map((product) => product.category)])];
  }
}

async function writeCategories(categories: string[]) {
  await mkdir(catalogDirectory, { recursive: true });
  const temporaryFile = path.join(catalogDirectory, `categories-${randomUUID()}.tmp`);
  await writeFile(temporaryFile, JSON.stringify(categories, null, 2) + "\n", "utf8");
  await rename(temporaryFile, categoriesFile);
}

async function writeProducts(products: Product[]) {
  await mkdir(catalogDirectory, { recursive: true });
  const temporaryFile = path.join(catalogDirectory, `products-${randomUUID()}.tmp`);
  await writeFile(temporaryFile, JSON.stringify(products, null, 2) + "\n", "utf8");
  await rename(temporaryFile, catalogFile);
}

let pendingWrite = Promise.resolve();

async function changeLocalCatalog(change: (categories: string[], products: Product[]) => { categories: string[]; products: Product[] }) {
  const operation = pendingWrite.then(async () => {
    const updated = change(await readCategories(), await readProducts());
    await writeProducts(updated.products);
    await writeCategories(updated.categories);
    return updated;
  });
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation;
}

export function parseCategoryName(value: unknown) {
  const name = requiredText(value, "Категория", 40);
  if (name.toLocaleLowerCase("ru") === "все") throw new CatalogInputError("Название «Все» зарезервировано для фильтра.");
  return name;
}

export async function createCategory(name: string) {
  name = parseCategoryName(name);
  if (databaseConfigured()) return databaseCreateCategory(name);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  await changeLocalCatalog((categories, products) => {
    if (categories.includes(name)) throw new CatalogInputError("Такая категория уже есть.");
    return { categories: [...categories, name], products };
  });
}

export async function renameCategory(oldName: string, name: string) {
  oldName = parseCategoryName(oldName);
  name = parseCategoryName(name);
  if (databaseConfigured()) return databaseRenameCategory(oldName, name);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  await changeLocalCatalog((categories, products) => {
    if (!categories.includes(oldName)) throw new CatalogInputError("Категория не найдена.");
    if (name !== oldName && categories.includes(name)) throw new CatalogInputError("Такая категория уже есть.");
    return { categories: categories.map((category) => category === oldName ? name : category), products: products.map((product) => product.category === oldName ? { ...product, category: name } : product) };
  });
}

export async function deleteCategory(name: string) {
  name = parseCategoryName(name);
  if (databaseConfigured()) return databaseDeleteCategory(name);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  await changeLocalCatalog((categories, products) => {
    if (!categories.includes(name)) throw new CatalogInputError("Категория не найдена.");
    if (products.some((product) => product.category === name)) throw new CatalogInputError("В категории есть товары. Сначала перенесите их в другую категорию.");
    return { categories: categories.filter((category) => category !== name), products };
  });
}

async function changeProducts(change: (products: Product[]) => Product[]) {
  const operation = pendingWrite.then(async () => {
    const updated = change(await readProducts());
    await writeProducts(updated);
    return updated;
  });
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function saveProduct(id: number, input: ProductInput) {
  if (databaseConfigured()) return databaseSaveProduct(id, input);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  const updated = await changeProducts((products) => {
    if (!products.some((product) => product.id === id)) throw new CatalogInputError("Товар не найден.");
    return products.map((product) => product.id === id ? { ...product, ...input } : product);
  });
  return updated.find((product) => product.id === id)!;
}

export async function createProduct(input: ProductInput) {
  if (databaseConfigured()) return databaseCreateProduct(input);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  let created!: Product;
  await changeProducts((products) => {
    const id = Math.max(0, ...products.map((product) => product.id)) + 1;
    created = { ...input, id, slug: `product-${id}` };
    return [...products, created];
  });
  return created;
}

export async function deleteProduct(id: number) {
  if (databaseConfigured()) return databaseDeleteProduct(id);
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
  await changeProducts((products) => {
    if (!products.some((product) => product.id === id)) throw new CatalogInputError("Товар не найден.");
    return products.filter((product) => product.id !== id);
  });
}

function requiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string") throw new CatalogInputError(`${label}: укажите текст.`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) throw new CatalogInputError(`${label}: от 1 до ${maxLength} символов.`);
  return trimmed;
}

function options(value: unknown, label: string) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 20 || value.some((item) => typeof item !== "string" || !item.trim() || item.length > 60)) {
    throw new CatalogInputError(`${label}: проверьте список значений.`);
  }
  return value.map((item: string) => item.trim());
}

export function parseProductInput(value: unknown, categories: string[]): ProductInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CatalogInputError("Некорректные данные товара.");
  const source = value as Record<string, unknown>;
  const category = requiredText(source.category, "Категория", 40);
  if (!categories.includes(category)) throw new CatalogInputError("Выберите категорию из списка.");
  const image = requiredText(source.image, "Изображение", 250);
  if (!/^\/(?:products\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)|api\/media\/[a-f0-9-]{36}\.(?:png|jpe?g|webp))$/.test(image)) {
    throw new CatalogInputError("Используйте загруженное изображение или файл из каталога товаров.");
  }
  const sizes = options(source.sizes, "Размеры");
  const models = options(source.models, "Модели");
  if (sizes?.length && models?.length) throw new CatalogInputError("Укажите размеры или модели, но не оба списка.");
  return {
    name: requiredText(source.name, "Название", 100),
    category,
    color: requiredText(source.color, "Цвет", 60),
    image,
    code: requiredText(source.code, "Код", 100),
    description: requiredText(source.description, "Описание", 1000),
    ...(sizes?.length ? { sizes } : {}),
    ...(models?.length ? { models } : {}),
  };
}
