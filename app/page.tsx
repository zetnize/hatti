import { HattiStore } from "@/components/hatti-store";
import { readCategories, readProducts } from "@/lib/catalog";
import type { Metadata } from "next";
import { brandStructuredData, serializeStructuredData, siteUrl, siteTitle, siteDescription } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: `${siteUrl}/`,
    siteName: "HATTI",
    type: "website",
    locale: "ru_RU",
    images: [{ url: `${siteUrl}/brand/hatti-social.jpg`, width: 1200, height: 630, alt: "HATTI — черкесская одежда и аксессуары" }],
  },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([readProducts(), readCategories()]);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(brandStructuredData) }} />
    <HattiStore products={products} categories={["Все", ...categories]} />
  </>;
}
