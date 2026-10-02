"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { categories, type Product, type ProductCategory } from "@/data/products";

type Draft = {
  name: string;
  category: ProductCategory;
  color: string;
  image: string;
  code: string;
  description: string;
  options: string;
};

const blankDraft: Draft = {
  name: "",
  category: "Футболки",
  color: "",
  image: "",
  code: "",
  description: "",
  options: "",
};

function draftFromProduct(product: Product): Draft {
  return {
    name: product.name,
    category: product.category,
    color: product.color,
    image: product.image,
    code: product.code,
    description: product.description,
    options: (product.models ?? product.sizes ?? []).join(", "),
  };
}

export function AdminPanel({ authenticated, initialProducts }: { authenticated: boolean; initialProducts: Product[] }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<number | null>(initialProducts[0]?.id ?? null);
  const [draft, setDraft] = useState<Draft>(initialProducts[0] ? draftFromProduct(initialProducts[0]) : blankDraft);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось войти.");
      setPassword("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось войти.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function selectProduct(product: Product) {
    setSelectedId(product.id);
    setDraft(draftFromProduct(product));
    setError("");
    setSaved(false);
  }

  function newProduct() {
    setSelectedId(null);
    setDraft(blankDraft);
    setError("");
    setSaved(false);
  }

  function setField<Key extends keyof Draft>(key: Key, value: Draft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось загрузить изображение.");
      setField("image", result.image);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const options = draft.options.split(",").map((item) => item.trim()).filter(Boolean);
    const body = {
      name: draft.name,
      category: draft.category,
      color: draft.color,
      image: draft.image,
      code: draft.code,
      description: draft.description,
      ...(draft.category === "Чехлы" ? { models: options } : { sizes: options }),
    };
    try {
      const response = await fetch(selectedId === null ? "/api/admin/products" : `/api/admin/products/${selectedId}`, {
        method: selectedId === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось сохранить товар.");
      const product = result.product as Product;
      setProducts((current) => selectedId === null ? [...current, product] : current.map((item) => item.id === product.id ? product : item));
      setSelectedId(product.id);
      setDraft(draftFromProduct(product));
      setSaved(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить товар.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct() {
    if (selectedId === null || busy) return;
    const product = products.find((item) => item.id === selectedId);
    if (!product || !window.confirm(`Удалить товар «${product.name}»? Это действие нельзя отменить.`)) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/products/${selectedId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось удалить товар.");
      const remaining = products.filter((item) => item.id !== selectedId);
      const next = remaining[0];
      setProducts(remaining);
      setSelectedId(next?.id ?? null);
      setDraft(next ? draftFromProduct(next) : blankDraft);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось удалить товар.");
    } finally {
      setBusy(false);
    }
  }

  if (!authenticated) {
    return (
      <main className="admin-root admin-login-page">
        <header className="admin-topbar"><a href="/" className="admin-wordmark">HATTI</a><span>CATALOG / ACCESS</span></header>
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <span className="admin-eyebrow">PRIVATE / 01</span>
          <h1 id="admin-login-title">Вход в каталог</h1>
          <p>Управление карточками товаров HATTI.</p>
          <form onSubmit={login}>
            <label>Логин<input name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label>Пароль<input name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Проверяем…" : "Войти"}<ArrowUpRight size={18} /></button>
          </form>
        </section>
        <a className="admin-back-link" href="/"><ArrowLeft size={16} /> Вернуться на сайт</a>
      </main>
    );
  }

  return (
    <main className="admin-root admin-workspace">
      <header className="admin-topbar">
        <div className="admin-brand"><a href="/" className="admin-wordmark">HATTI</a><span>УПРАВЛЕНИЕ КАТАЛОГОМ</span></div>
        <div className="admin-top-actions"><a href="/" target="_blank" rel="noreferrer">Смотреть сайт <ArrowUpRight size={15} /></a><button onClick={logout}><LogOut size={15} /> Выйти</button></div>
      </header>
      <div className="admin-heading"><div><span className="admin-eyebrow">HATTI / BACK OFFICE</span><h1>Товары</h1></div><span className="admin-count">{products.length} объектов в каталоге</span></div>
      <div className="admin-columns">
        <aside className="admin-list" aria-label="Список товаров">
          <div className="admin-list-head"><span>КОЛЛЕКЦИЯ</span><button onClick={newProduct}><Plus size={16} /> Добавить</button></div>
          <div className="admin-list-items">
            {products.length === 0 && <p className="admin-empty-list">Товаров пока нет. Добавьте первый объект.</p>}
            {products.map((product) => (
              <button key={product.id} className={`admin-list-item${selectedId === product.id ? " is-selected" : ""}`} onClick={() => selectProduct(product)} aria-current={selectedId === product.id ? "true" : undefined}>
                <span className="admin-list-thumb"><Image src={product.image} alt="" fill sizes="56px" /></span>
                <span><small>{product.code}</small><strong>{product.name}</strong><small>{product.category}</small></span>
              </button>
            ))}
          </div>
        </aside>
        <section className="admin-editor" aria-labelledby="admin-editor-title">
          <div className="admin-editor-head"><div><span className="admin-eyebrow">{selectedId === null ? "НОВЫЙ ОБЪЕКТ" : `ОБЪЕКТ / ${String(selectedId).padStart(2, "0")}`}</span><h2 id="admin-editor-title">{selectedId === null ? "Новый товар" : "Редактирование"}</h2></div><span className="admin-draft-state">{saved ? <><Check size={15} /> Сохранено</> : "Изменения появятся на сайте после сохранения"}</span></div>
          <form onSubmit={save} className="admin-form">
            <div className="admin-image-field">
              <div className="admin-preview">{draft.image ? <Image src={draft.image} alt="Предпросмотр товара" fill sizes="(max-width: 800px) 100vw, 240px" /> : <ImagePlus size={34} strokeWidth={1.4} />}</div>
              <div><label className="admin-upload-button">{uploading ? "Загружаем…" : "Загрузить изображение"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = ""; }} /></label><p>PNG, JPEG или WebP до 8 МБ. Картинка сразу появится в предпросмотре.</p><label className="admin-path-label">Путь к изображению<input value={draft.image} onChange={(event) => setField("image", event.target.value)} placeholder="/products/image.png" required /></label></div>
            </div>
            <div className="admin-fields">
              <label className="admin-field-wide">Название<input value={draft.name} onChange={(event) => setField("name", event.target.value)} maxLength={100} required /></label>
              <label>Категория<select value={draft.category} onChange={(event) => setField("category", event.target.value as ProductCategory)}>{categories.filter((category) => category !== "Все").map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Цвет<input value={draft.color} onChange={(event) => setField("color", event.target.value)} maxLength={60} required /></label>
              <label className="admin-field-wide">Код товара<input value={draft.code} onChange={(event) => setField("code", event.target.value)} maxLength={100} placeholder="OBJECT 21 / ..." required /></label>
              <label className="admin-field-wide">Описание<textarea value={draft.description} onChange={(event) => setField("description", event.target.value)} maxLength={1000} rows={4} required /></label>
              <label className="admin-field-wide">{draft.category === "Чехлы" ? "Модели" : "Размеры или варианты"}<input value={draft.options} onChange={(event) => setField("options", event.target.value)} placeholder={draft.category === "Чехлы" ? "iPhone 15, iPhone 15 Pro" : "S, M, L, XL"} /><small>Разделяйте варианты запятыми. Можно оставить пустым.</small></label>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <div className="admin-form-actions">
              {selectedId !== null && <button className="admin-delete-button" type="button" disabled={busy || uploading} onClick={removeProduct}><Trash2 size={16} /> Удалить товар</button>}
              <button className="admin-primary-button" type="submit" disabled={busy || uploading}><Save size={17} /> {busy ? "Сохраняем…" : "Сохранить товар"}</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
