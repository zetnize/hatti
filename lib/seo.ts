export const siteUrl = "https://hatti-brand.ru";
export const siteTitle = "HATTI — черкесская одежда и аксессуары: каталог бренда";
export const siteDescription =
  "HATTI — этно-бренд черкесской одежды и аксессуаров. Футболки, кепки, обложки и чехлы. Выберите изделия и обратитесь к бренду в Instagram или Telegram.";

export const brandStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HATTI",
      alternateName: ["Хатти", "Хати"],
      description: "Бренд черкесской одежды и аксессуаров",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/brand/hatti-icon-512.png`,
      sameAs: ["https://www.instagram.com/hatti_brand/", "https://t.me/ankhnb"],
      contactPoint: { "@type": "ContactPoint", email: "khatit12@mail.ru", contactType: "Вопросы об изделиях" },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "HATTI — черкесская одежда и аксессуары",
      alternateName: ["Хатти", "Хати"],
      url: `${siteUrl}/`,
      inLanguage: "ru",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
