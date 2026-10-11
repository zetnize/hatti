import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { databaseConfigured, databaseSaveMedia } from "@/lib/database";
import { ImageInputError, optimizeProductImage } from "@/lib/image-upload";
import { maxImageBytes, maxProductImages } from "@/lib/product-display";

export const runtime = "nodejs";

const maxRequestSize = maxImageBytes * maxProductImages + 65_536;

export async function POST(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > maxRequestSize) return NextResponse.json({ error: "Файлы слишком большие." }, { status: 413 });
  try {
    // Bound streamed bodies too: Content-Length can be missing or inaccurate.
    const reader = request.body?.getReader();
    if (!reader) throw new ImageInputError("Выберите изображения.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxRequestSize) { await reader.cancel(); throw new ImageInputError("Файлы слишком большие."); }
      chunks.push(chunk.value);
    }
    let form: FormData;
    try {
      form = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type") ?? "" }, body: Buffer.concat(chunks) }).formData();
    } catch { throw new ImageInputError("Некорректный запрос загрузки. Выберите изображения ещё раз."); }
    const files = form.has("images") ? form.getAll("images") : form.getAll("image");
    if (!files.length || files.length > maxProductImages || files.some((file) => !(file instanceof File))) {
      throw new ImageInputError("Выберите от 1 до 10 изображений.");
    }
    const optimized: Buffer[] = [];
    for (const file of files) optimized.push(await optimizeProductImage(file as File));
    const images: string[] = [];
    for (const bytes of optimized) {
      const filename = `${randomUUID()}.webp`;
      if (databaseConfigured()) await databaseSaveMedia(filename, "image/webp", bytes);
      else {
        if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
        const directory = path.join(process.cwd(), ".data", "uploads");
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
      }
      images.push(`/api/media/${filename}`);
    }
    return NextResponse.json({ images, image: images[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ImageInputError ? error.message : "Не удалось загрузить изображение." }, { status: error instanceof ImageInputError ? 400 : 500 });
  }
}
