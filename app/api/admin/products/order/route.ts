import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { CatalogInputError, reorderProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 1_048_576) return NextResponse.json({ error: "Список слишком большой." }, { status: 413 });
  try {
    const body = await request.json();
    const products = await reorderProducts(body?.ids);
    revalidatePath("/");
    revalidatePath("/aloidimihdyrt");
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Некорректные данные сортировки." }, { status: 400 });
    return NextResponse.json({ error: error instanceof CatalogInputError ? error.message : "Не удалось сохранить порядок." }, { status: error instanceof CatalogInputError ? 400 : 500 });
  }
}
