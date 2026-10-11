import type { Product } from "@/data/products";

export const maxProductImages = 10;
export const maxImageBytes = 5 * 1024 * 1024;

export function productImages(product: Pick<Product, "images" | "image" | "name">) {
  return product.images ?? (product.image ? [{ src: product.image, alt: product.name }] : []);
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(price)} ₽`;
}

export function priceLabel(product: Product) {
  if (product.show_price === false) return "";
  return product.price ? `${product.price_from ? "от " : ""}${formatPrice(product.price)}` : "Цена по запросу";
}

export function discountPercent(product: Product) {
  return product.price && product.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100) : 0;
}

export function normalizeProduct(product: Product, index: number): Product {
  const images = productImages(product);
  return { ...product, images, image: images[0]?.src ?? "", sort_order: product.sort_order ?? index,
    currency: "RUB", show_price: product.show_price ?? true,
    price_from: product.price_from ?? false, price: product.price ?? null, old_price: product.old_price ?? null };
}
