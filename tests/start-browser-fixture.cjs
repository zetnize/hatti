// Disposable local app, with no access to .env files or the live database.
require("./register.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { pbkdf2Sync } = require("node:crypto");
const { products } = require("../data/products.ts");

(async () => {
  const root = path.resolve(__dirname, "..");
  const output = path.join(root, "output", "playwright");
  await fs.mkdir(output, { recursive: true });
  const fixture = await fs.mkdtemp(path.join(output, "hatti-fixture-"));
  for (const item of ["app", "components", "data", "lib", "db", "public", "package.json", "pnpm-lock.yaml", "next.config.ts", "postcss.config.mjs", "tsconfig.json", "next-env.d.ts"]) {
    await fs.cp(path.join(root, item), path.join(fixture, item), { recursive: true });
  }
  await fs.symlink(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "junction");
  await fs.mkdir(path.join(fixture, ".data"));
  const catalog = products.map((p) => ({ ...p }));
  catalog[0] = { ...catalog[0], images: products.slice(0, 3).map((p, i) => ({ src: p.image, alt: `Тестовое фото ${i + 1}` })), price: 12500, old_price: 15000, currency: "RUB", price_from: true };
  catalog[1] = { ...catalog[1], images: [], image: "", price: 999999999999.99, currency: "RUB" };
  catalog[2] = { ...catalog[2], show_price: false };
  await fs.writeFile(path.join(fixture, ".data", "products.json"), JSON.stringify(catalog));
  await fs.writeFile(path.join(output, "fixture-path.txt"), fixture);
  const salt = "00112233445566778899aabbccddeeff";
  const child = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "5011"], {
    cwd: fixture, stdio: "inherit", env: { ...process.env, DATABASE_URL: "", NODE_ENV: "development", HATTI_ADMIN_USER: "hatti-test", HATTI_ADMIN_SALT: salt,
      HATTI_ADMIN_HASH: pbkdf2Sync("hatti-test-only", Buffer.from(salt, "hex"), 210000, 32, "sha256").toString("hex"), HATTI_ADMIN_SESSION_KEY: "hatti-browser-fixture-only" },
  });
  console.log(`Test fixture: ${fixture}`);
  process.on("SIGINT", () => child.kill());
  child.on("exit", (code) => { process.exitCode = code ?? 0; });
})();
