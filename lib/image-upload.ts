import sharp from "sharp";
import { maxImageBytes } from "@/lib/product-display";

export class ImageInputError extends Error {}

export async function optimizeProductImage(file: File) {
  if (!file.size || file.size > maxImageBytes) throw new ImageInputError("Каждое изображение должно быть до 5 МБ.");
  if (!/\.(?:jpe?g|png|webp)$/i.test(file.name) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new ImageInputError("Поддерживаются только JPG, PNG и WebP.");
  }
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "warning", limitInputPixels: 50_000_000 });
    const metadata = await image.metadata();
    const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    if (!metadata.format || !(metadata.format in mime) || mime[metadata.format as keyof typeof mime] !== file.type) {
      throw new ImageInputError("Содержимое файла не соответствует формату JPG, PNG или WebP.");
    }
    return await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).timeout({ seconds: 10 }).toBuffer();
  } catch (error) {
    if (error instanceof ImageInputError) throw error;
    throw new ImageInputError("Не удалось прочитать изображение. Файл повреждён или превышает 50 мегапикселей.");
  }
}
