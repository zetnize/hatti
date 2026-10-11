"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, Save } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { priceLabel } from "@/lib/product-display";

export function AdminProductOrder({ products, disabled, onBusy, onSaved }: {
  products: Product[]; disabled: boolean; onBusy: (busy: boolean) => void; onSaved: (products: Product[]) => void;
}) {
  const [ids, setIds] = useState<number[] | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Preserve unsaved moves when a card is edited, add new cards at the end, omit deleted cards.
  const order = ids ? [...ids.filter((id) => products.some((product) => product.id === id)), ...products.filter((product) => !ids.includes(product.id)).map((product) => product.id)] : products.map((product) => product.id);
  const changed = order.some((id, index) => id !== products[index]?.id);
  function move(from: number, to: number) {
    if (disabled || saving || to < 0 || to >= order.length) return;
    const next = [...order];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setIds(next); setMessage(""); setError("");
  }
  async function save() {
    setSaving(true); onBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/products/order", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: order }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось сохранить порядок.");
      onSaved(result.products); setIds(null); setMessage("Порядок сохранён. Главная страница обновлена.");
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось сохранить порядок."); }
    finally { setSaving(false); onBusy(false); }
  }
  return <section className="admin-categories admin-order" aria-labelledby="admin-order-title">
    <div className="admin-categories-head"><div><span className="admin-eyebrow">ГЛАВНАЯ СТРАНИЦА</span><h2 id="admin-order-title">Порядок карточек</h2></div>
      <button type="button" disabled={disabled || saving || !changed} onClick={save}><Save size={17} />{saving ? "Сохраняем…" : "Сохранить порядок"}</button></div>
    <div className="admin-order-body"><p>Перетащите карточку за ручку или используйте кнопки вверх и вниз. Затем сохраните порядок.</p>
      <ol className="admin-order-list">
        {order.map((id, index) => {
          const product = products.find((item) => item.id === id)!;
          return <li key={id} className={dragged === index ? "is-dragging" : ""}
            onDragOver={(event) => { if (dragged !== null && !disabled && !saving) event.preventDefault(); }}
            onDrop={(event) => { if (dragged === null) return; event.preventDefault(); move(dragged, index); setDragged(null); }}>
            <button type="button" className="admin-drag-handle" draggable={!disabled && !saving} disabled={disabled || saving}
              aria-label={`Перетащить ${product.name}`} onDragStart={(event) => { setDragged(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(id)); }}
              onDragEnd={() => setDragged(null)}><GripVertical size={18} /></button>
            <span className="admin-list-thumb">{product.image ? <Image src={product.image} alt="" fill sizes="56px" draggable={false} /> : <span>—</span>}</span>
            <span className="admin-order-name"><strong>{product.name}</strong><small>{priceLabel(product) || "Цена скрыта"}</small></span>
            <span className="admin-reorder-actions"><button type="button" disabled={disabled || saving || index === 0} aria-label={`Поднять ${product.name}`} onClick={() => move(index, index - 1)}><ArrowUp size={18} /></button>
              <button type="button" disabled={disabled || saving || index === order.length - 1} aria-label={`Опустить ${product.name}`} onClick={() => move(index, index + 1)}><ArrowDown size={18} /></button></span>
          </li>;
        })}
      </ol>
      {!products.length && <p>Добавьте товары, чтобы настроить порядок.</p>}
      {message && <p className="admin-success" role="status">{message}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  </section>;
}
