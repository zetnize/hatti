import type { Metadata } from "next";
import { siteUrl, siteTitle, siteDescription } from "@/lib/seo";
import "@fontsource-variable/alumni-sans";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/cyrillic-500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [
      { url: "/brand/hatti-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/hatti-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/brand/hatti-apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "HATTI",
    images: [{ url: "/brand/hatti-social.jpg", width: 1200, height: 630, alt: "HATTI — черкесская одежда и аксессуары" }],
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/brand/hatti-social.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
