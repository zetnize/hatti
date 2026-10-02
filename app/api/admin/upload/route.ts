import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requestIsAdmin, sameOrigin } from "@/lib/admin-auth";
import { databaseConfigured, databaseSaveMedia } from "@/lib/database";

export const runtime = "nodejs";

const maxImageSize = 8 * 1024 * 1024;
class ImageInputError extends Error {}

function imageExtension(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return "jpg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function POST(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > maxImageSize + 16_384) return NextResponse.json({ error: "Файл слишком большой." }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0 || file.size > maxImageSize) throw new ImageInputError("Выберите изображение до 8 МБ.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = imageExtension(bytes);
    if (!extension) throw new ImageInputError("Поддерживаются PNG, JPEG и WebP.");
    const filename = `${randomUUID()}.${extension}`;
    if (databaseConfigured()) {
      const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
      await databaseSaveMedia(filename, contentType, bytes);
    } else {
      if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production.");
      const directory = path.join(process.cwd(), ".data", "uploads");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    }
    return NextResponse.json({ image: `/api/media/${filename}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ImageInputError ? error.message : "Не удалось загрузить изображение." }, { status: error instanceof ImageInputError ? 400 : 500 });
  }
}
