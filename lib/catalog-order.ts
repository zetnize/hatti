import type { Product } from "@/data/products";
import { CatalogInputError } from "@/lib/catalog-errors";

export function validateProductOrder(value: unknown, products: Pick<Product, "id">[]): number[] {
  const ids = new Set(products.map((product) => product.id));
  if (!Array.isArray(value) || value.length !== products.length || new Set(value).size !== value.length ||
    value.some((id) => !Number.isSafeInteger(id) || !ids.has(id))) {
    throw new CatalogInputError("Список товаров изменился. Обновите страницу и повторите сортировку.");
  }
  return value;
}
