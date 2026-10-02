import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const adminCookieName = "hatti_admin_session";
const sessionAgeSeconds = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sessionKey() {
  return process.env.HATTI_ADMIN_SESSION_KEY;
}

export function adminIsConfigured() {
  return Boolean(
    process.env.HATTI_ADMIN_USER &&
      process.env.HATTI_ADMIN_SALT &&
      process.env.HATTI_ADMIN_HASH &&
      sessionKey(),
  );
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!adminIsConfigured()) return false;
  const hash = pbkdf2Sync(password, Buffer.from(process.env.HATTI_ADMIN_SALT!, "hex"), 210_000, 32, "sha256");
  const expected = Buffer.from(process.env.HATTI_ADMIN_HASH!, "hex");
  return (
    safeEqual(username, process.env.HATTI_ADMIN_USER!) &&
    hash.length === expected.length &&
    timingSafeEqual(hash, expected)
  );
}

function signature(payload: string) {
  return createHmac("sha256", sessionKey()!).update(payload).digest("hex");
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionAgeSeconds;
  const payload = `${expires}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminSession(token: string | undefined) {
  if (!token || !adminIsConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, actual] = parts;
  if (!/^\d{10}$/.test(expires) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(actual)) return false;
  if (Number(expires) <= Date.now() / 1000) return false;
  return safeEqual(actual, signature(`${expires}.${nonce}`));
}

export function requestIsAdmin(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(adminCookieName)?.value);
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.host === host;
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionAgeSeconds,
};
