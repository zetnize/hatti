import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { CatalogInputError, createProduct, parseProductInput, readCategories, readProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  return NextResponse.json({ products: await readProducts() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  try {
    const input = parseProductInput(await request.json(), await readCategories());
    const product = await createProduct(input);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CatalogInputError ? error.message : "Не удалось сохранить товар." }, { status: error instanceof CatalogInputError ? 400 : 500 });
  }
}
