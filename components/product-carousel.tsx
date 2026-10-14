"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { useRef, useState } from "react";
import type { Product } from "@/data/products";
import { productImages } from "@/lib/product-display";
import { productImageAlt } from "@/lib/product-image-alt";

export function ProductCarousel({ product, onOpen, className = "product-image", sizes = "(max-width: 700px) 50vw, 28vw" }: {
  product: Product; onOpen?: () => void; className?: string; sizes?: string;
}) {
  const images = productImages(product);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const reducedMotion = useReducedMotion();
  const currentIndex = Math.min(index, Math.max(0, images.length - 1));
  const image = images[currentIndex];
  const multiple = images.length > 1;
  const change = (next: number) => setIndex((next + images.length) % images.length);
  const visual = image && failed !== image.src ? <Image src={image.src} alt={productImageAlt(image, product.name, currentIndex)}
    fill sizes={sizes} loading="lazy" onError={() => setFailed(image.src)} draggable={false} />
    : <span className="product-image-placeholder"><ImageOff size={28} aria-hidden="true" /><span>Изображение недоступно</span></span>;
  const slides = <AnimatePresence initial={false}>
    <motion.div key={image?.src ?? "empty"} className="product-carousel-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }}>{visual}</motion.div>
  </AnimatePresence>;

  return <div className={`product-carousel ${className}`} role="region" aria-roledescription={multiple ? "карусель" : undefined}
    aria-label={`Изображения: ${product.name}`} tabIndex={multiple ? 0 : undefined}
    onKeyDown={(event) => {
      if (!multiple) return;
      const next = event.key === "ArrowRight" ? currentIndex + 1 : event.key === "ArrowLeft" ? currentIndex - 1 :
        event.key === "Home" ? 0 : event.key === "End" ? images.length - 1 : null;
      if (next !== null) { event.preventDefault(); event.stopPropagation(); change(next); }
    }}
    onPointerDown={(event) => {
      swiped.current = false;
      start.current = null;
      if (!multiple || event.pointerType === "mouse" || (event.target as HTMLElement).closest("[data-carousel-control]")) return;
      start.current = { x: event.clientX, y: event.clientY };
    }}
    onPointerUp={(event) => {
      if (!start.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        swiped.current = true;
        change(currentIndex + (dx < 0 ? 1 : -1));
      }
    }}
    onPointerCancel={() => { start.current = null; }}
    onClickCapture={(event) => {
      if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; }
    }}>
    {onOpen ? <button type="button" className="product-carousel-open" aria-label={`Открыть ${product.name}`} onClick={onOpen}>
      {slides}<span className="product-arrow"><ArrowUpRight size={19} /></span>
    </button> : slides}
    {multiple && <>
      <button type="button" data-carousel-control className="carousel-arrow carousel-arrow--prev" aria-label="Предыдущее изображение"
        onClick={(event) => { event.stopPropagation(); change(currentIndex - 1); }}><span className="carousel-arrow-icon" aria-hidden="true" /></button>
      <button type="button" data-carousel-control className="carousel-arrow carousel-arrow--next" aria-label="Следующее изображение"
        onClick={(event) => { event.stopPropagation(); change(currentIndex + 1); }}><span className="carousel-arrow-icon" aria-hidden="true" /></button>
      <div className="carousel-dots" role="group" aria-label="Выбор изображения">
        {images.map((item, position) => <button key={item.src} type="button" data-carousel-control
          aria-label={`Изображение ${position + 1} из ${images.length}`} aria-pressed={position === currentIndex}
          onClick={(event) => { event.stopPropagation(); change(position); }}><span /></button>)}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">Изображение {currentIndex + 1} из {images.length}</span>
    </>}
  </div>;
}
