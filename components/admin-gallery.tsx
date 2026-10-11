"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import type { ProductImage } from "@/data/products";
import { maxImageBytes, maxProductImages } from "@/lib/product-display";

export function AdminGallery({ images, disabled, uploading, onChange, onUploading, onError }: {
  images: ProductImage[]; disabled: boolean; uploading: boolean;
  onChange: (images: ProductImage[]) => void; onUploading: (value: boolean) => void; onError: (message: string) => void;
}) {
  const id = useId();
  const [dragged, setDragged] = useState<number | null>(null);
  function move(from: number, to: number) {
    if (disabled || to < 0 || to >= images.length) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }
  async function upload(files: File[]) {
    if (disabled || !files.length) return;
    onError("");
    if (images.length + files.length > maxProductImages) { onError("В галерее может быть не более 10 изображений."); return; }
    if (files.some((file) => !file.size || file.size > maxImageBytes || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || !/\.(?:jpe?g|png|webp)$/i.test(file.name))) {
      onError("Выберите JPG, PNG или WebP: каждый файл до 5 МБ."); return;
    }
    onUploading(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("images", file));
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось загрузить изображения.");
      onChange([...images, ...result.images.map((src: string) => ({ src, alt: "" }))]);
    } catch (error) { onError(error instanceof Error ? error.message : "Не удалось загрузить изображения."); }
    finally { onUploading(false); }
  }
  return <section className="admin-gallery" aria-label="Изображения товара"
    onDragOver={(event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); }}
    onDrop={(event) => {
      if (event.dataTransfer.files.length) { event.preventDefault(); void upload(Array.from(event.dataTransfer.files)); }
    }}>
    <div className="admin-gallery-head"><strong>Изображения / {images.length} из 10</strong>
      <label htmlFor={id} className={`admin-upload-button${disabled ? " is-disabled" : ""}`}><ImagePlus size={17} />{uploading ? "Загружаем…" : "Добавить изображения"}
        <input id={id} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled}
          onChange={(event) => { void upload(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
      </label>
    </div>
    <p>Перетащите файлы сюда или выберите их. JPG, PNG, WebP до 5 МБ. Первое фото — обложка. Меняйте порядок за ручку или кнопками.</p>
    <ol className="admin-gallery-list">
      {images.map((image, index) => <li key={image.src} className={dragged === index ? "is-dragging" : ""}
        onDragOver={(event) => { if (dragged !== null && !disabled) event.preventDefault(); }}
        onDrop={(event) => {
          if (dragged === null || event.dataTransfer.files.length) return;
          event.preventDefault(); event.stopPropagation(); move(dragged, index); setDragged(null);
        }}>
        <div className="admin-gallery-thumb"><Image src={image.src} alt={image.alt || `Фото ${index + 1}`} fill sizes="100px" draggable={false} />
          <span>{index === 0 ? "Обложка" : index + 1}</span></div>
        <label>Описание фото<input value={image.alt} maxLength={200} disabled={disabled} placeholder="Если пусто — название товара"
          onChange={(event) => onChange(images.map((item, position) => position === index ? { ...item, alt: event.target.value } : item))} /></label>
        <div className="admin-reorder-actions">
          <button type="button" draggable={!disabled} disabled={disabled} className="admin-drag-handle" aria-label={`Перетащить фото ${index + 1}`}
            onDragStart={(event) => { setDragged(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)); }}
            onDragEnd={() => setDragged(null)}><GripVertical size={18} /></button>
          <button type="button" disabled={disabled || index === 0} aria-label={`Переместить фото ${index + 1} раньше`} onClick={() => move(index, index - 1)}><ArrowUp size={17} /></button>
          <button type="button" disabled={disabled || index === images.length - 1} aria-label={`Переместить фото ${index + 1} позже`} onClick={() => move(index, index + 1)}><ArrowDown size={17} /></button>
          <button type="button" disabled={disabled} aria-label={`Удалить фото ${index + 1} из галереи`} onClick={() => onChange(images.filter((_, position) => position !== index))}><Trash2 size={17} /></button>
        </div>
      </li>)}
    </ol>
    {!images.length && <p className="admin-gallery-empty">Нет изображений. На сайте будет показана заглушка.</p>}
    <span className="sr-only" role="status">{uploading ? "Загрузка изображений" : `В галерее ${images.length} изображений`}</span>
  </section>;
}
