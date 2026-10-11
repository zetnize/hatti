import type { MetadataRoute } from "next";
import { readProducts } from "@/lib/catalog";
import { productImages } from "@/lib/product-display";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await readProducts();
  const images = [...new Set(products.flatMap(productImages).map(({ src }) => new URL(src, siteUrl).href))];
  return [{ url: `${siteUrl}/`, images }];
}
