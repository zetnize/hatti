import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { CatalogInputError, deleteProduct, parseProductInput, saveProduct } from "@/lib/catalog";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Некорректный ID товара." }, { status: 400 });
  try {
    const input = parseProductInput(await request.json());
    const product = await saveProduct(id, input);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CatalogInputError ? error.message : "Не удалось сохранить товар." }, { status: error instanceof CatalogInputError ? 400 : 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Некорректный ID товара." }, { status: 400 });
  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CatalogInputError ? error.message : "Не удалось удалить товар." }, { status: error instanceof CatalogInputError ? 400 : 500 });
  }
}
