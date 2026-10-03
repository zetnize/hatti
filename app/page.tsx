import { HattiStore } from "@/components/hatti-store";
import { readCategories, readProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([readProducts(), readCategories()]);
  return <HattiStore products={products} categories={["Все", ...categories]} />;
}
