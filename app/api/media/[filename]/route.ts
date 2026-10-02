import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { databaseConfigured, databaseReadMedia } from "@/lib/database";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const filename = (await context.params).filename;
  if (!/^[a-f0-9-]{36}\.(?:png|jpg|webp)$/.test(filename)) return new Response(null, { status: 404 });
  const useDatabase = databaseConfigured();
  try {
    const stored = useDatabase ? await databaseReadMedia(filename) : null;
    if (useDatabase && !stored) return new Response(null, { status: 404 });
    if (!useDatabase && process.env.NODE_ENV === "production") return new Response(null, { status: 503 });
    const image = stored?.bytes ?? await readFile(path.join(process.cwd(), ".data", "uploads", filename));
    return new NextResponse(Uint8Array.from(image), {
      headers: {
        "Content-Type": stored?.content_type ?? contentTypes[filename.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: useDatabase ? 503 : 404 });
  }
}
