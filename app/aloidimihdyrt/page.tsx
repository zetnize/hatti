import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminPanel } from "@/components/admin-panel";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { readProducts } from "@/lib/catalog";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Управление каталогом — HATTI",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = verifyAdminSession((await cookies()).get(adminCookieName)?.value);
  return <AdminPanel key={authenticated ? "editor" : "login"} authenticated={authenticated} initialProducts={authenticated ? await readProducts() : []} />;
}
