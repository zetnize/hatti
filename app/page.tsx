import { HattiStore } from "@/components/hatti-store";
import { readProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <HattiStore products={await readProducts()} />;
}
