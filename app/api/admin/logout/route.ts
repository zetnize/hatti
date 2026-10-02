import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, sameOrigin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(adminCookieName);
  return response;
}
