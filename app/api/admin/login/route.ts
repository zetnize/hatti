import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, createAdminSession, sameOrigin, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

let failedAttempts = 0;
let blockedUntil = 0;

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  if (Date.now() < blockedUntil) return NextResponse.json({ error: "Слишком много попыток. Повторите позже." }, { status: 429 });
  if (Number(request.headers.get("content-length")) > 4096) return NextResponse.json({ error: "Некорректный запрос." }, { status: 413 });

  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }
  const username = credentials?.username;
  const password = credentials?.password;
  const valid = typeof username === "string" && typeof password === "string" && password.length <= 200 && verifyAdminCredentials(username, password);
  if (!valid) {
    failedAttempts += 1;
    if (failedAttempts >= 5) {
      blockedUntil = Date.now() + 15 * 60 * 1000;
      failedAttempts = 0;
    }
    return NextResponse.json({ error: "Неверный логин или пароль." }, { status: 401 });
  }

  failedAttempts = 0;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, createAdminSession(), adminCookieOptions);
  return response;
}
