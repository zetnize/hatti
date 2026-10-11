import { CatalogInputError } from "@/lib/catalog-errors";

export function parsePrice(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  if ((typeof value !== "number" && typeof value !== "string") || !/^\d+(?:\.\d{1,2})?$/.test(String(value)) ||
    !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 999_999_999_999.99) {
    throw new CatalogInputError(`${label}: введите положительное число до 999 999 999 999,99, максимум два знака после запятой.`);
  }
  return Number(value);
}
