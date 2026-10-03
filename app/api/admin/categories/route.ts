import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { CatalogInputError, createCategory, deleteCategory, parseCategoryName, readCategories, renameCategory } from "@/lib/catalog";

export const runtime = "nodejs";

function failure(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
  if (code === "23505") return NextResponse.json({ error: "Такая категория уже есть." }, { status: 400 });
  if (code === "23503") return NextResponse.json({ error: "В категории есть товары. Сначала перенесите их в другую категорию." }, { status: 400 });
  return NextResponse.json(
    { error: error instanceof CatalogInputError ? error.message : "Не удалось изменить категории." },
    { status: error instanceof CatalogInputError ? 400 : 500 },
  );
}

function allowed(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  return NextResponse.json({ categories: await readCategories() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const denied = allowed(request);
  if (denied) return denied;
  try {
    const { name } = await request.json();
    await createCategory(parseCategoryName(name));
    return NextResponse.json({ categories: await readCategories() }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: NextRequest) {
  const denied = allowed(request);
  if (denied) return denied;
  try {
    const { oldName, name } = await request.json();
    await renameCategory(parseCategoryName(oldName), parseCategoryName(name));
    return NextResponse.json({ categories: await readCategories() });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest) {
  const denied = allowed(request);
  if (denied) return denied;
  try {
    const { name } = await request.json();
    await deleteCategory(parseCategoryName(name));
    return NextResponse.json({ categories: await readCategories() });
  } catch (error) {
    return failure(error);
  }
}
