import type { Metadata } from "next";
import "@fontsource-variable/alumni-sans";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "HATTI — Circassia / Present Tense",
  description:
    "HATTI — современная черкесская одежда и аксессуары. The concept of national identity.",
  keywords: ["HATTI", "черкесская одежда", "Circassia", "streetwear"],
  openGraph: {
    title: "HATTI — Circassia / Present Tense",
    description: "Национальная идентичность — не прошлое. Она живёт сейчас.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
