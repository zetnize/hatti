"use client";

import Image from "next/image";
import Lenis from "lenis";
import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  AtSign,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Product } from "@/data/products";

type Filter = string;
type CartItem = { productId: number; size: string; quantity: number };
type LegalKey = "terms" | "privacy" | "personal-data" | "cookies" | "delivery" | "details";

const legalDocuments: Record<LegalKey, { label: string; title: string; sections: { heading: string; text: string }[] }> = {
  terms: {
    label: "О каталоге",
    title: "Каталог и обращения",
    sections: [
      { heading: "Статус", text: "HATTI пока показывает изделия и собирает обращения о них. Сайт не принимает оплату и не подтверждает заказы. Цены, наличие и условия будущих продаж здесь не опубликованы." },
      { heading: "Как связаться", text: "Можно сохранить список заинтересовавших изделий и написать HATTI в Instagram или Telegram. Такое сообщение является запросом информации об изделиях, а не оформлением покупки. Не отправляйте адрес доставки и платёжные данные." },
      { heading: "Перед началом продаж", text: "После оформления деятельности будут опубликованы данные продавца, цены, порядок оплаты, доставки и возврата. До этого сайт работает как каталог." },
    ],
  },
  privacy: {
    label: "Данные и связь",
    title: "Данные при обращении",
    sections: [
      { heading: "На сайте", text: "Здесь нет формы для имени, телефона, адреса или оплаты. Сайт не сохраняет сведения посетителей в базе данных. Выбранные изделия остаются в localStorage вашего браузера. При обращении к серверу технические сведения о запросе, например IP-адрес, могут обрабатываться провайдером размещения." },
      { heading: "В мессенджерах", text: "Если вы сами пишете HATTI в Instagram или Telegram, соответствующий сервис и адресат получают ваш профиль и содержание сообщения. Мы не переносим переписку в базу сайта. Пока продажи не начались, не присылайте адрес и платёжные данные." },
      { heading: "Владелец и обращения о данных", text: "Хатит Анна Нальбиевна, khatit12@mail.ru. По вопросам доступа к сообщениям, их исправления или удаления напишите на этот адрес либо в тот аккаунт Instagram или Telegram, куда вы обращались. Сведения об используемых сервисах и сроках хранения будут уточнены после проверки фактической обработки данных." },
    ],
  },
  "personal-data": {
    label: "Локальное хранение",
    title: "Данные в браузере",
    sections: [
      { heading: "Список изделий", text: "Состав вашей подборки хранится только в localStorage браузера и не отправляется на сервер HATTI. Вы можете удалить его, очистив данные сайта в браузере." },
      { heading: "Сообщения", text: "Список попадает в переписку только если вы сами скопируете и отправите его. Не включайте в обращение лишние персональные сведения." },
      { heading: "Права", text: "По вопросам доступа к сообщениям, их уточнения или удаления обратитесь к HATTI через тот канал, в котором вы написали, либо по адресу khatit12@mail.ru." },
    ],
  },
  cookies: {
    label: "Cookies",
    title: "Cookies и локальное хранение",
    sections: [
      { heading: "Текущая версия", text: "В коде сайта нет рекламных или аналитических cookies. Для сохранения выбранных изделий применяется localStorage. Закрытая админ-панель использует cookie для входа администратора." },
      { heading: "Управление", text: "Удалить сохранённую корзину можно через настройки браузера или очистку данных сайта. Блокировка localStorage не мешает просмотру каталога, но корзина не сохранится между посещениями." },
    ],
  },
  delivery: {
    label: "Доставка и возврат",
    title: "Будущие условия продажи",
    sections: [
      { heading: "Сейчас", text: "HATTI пока не принимает оплату и не отправляет товары. Условия доставки, обмена и возврата будут опубликованы до начала продаж." },
      { heading: "Права покупателей", text: "После запуска дистанционной продажи права покупателей определяются законом РФ «О защите прав потребителей», включая статью 26.1. Условия сайта не могут отменить права, установленные законом." },
    ],
  },
  details: {
    label: "Реквизиты",
    title: "Сведения о HATTI",
    sections: [
      { heading: "Владелец", text: "Хатит Анна Нальбиевна. Сейчас HATTI — каталог частного лица. Продажи и приём оплаты не начались. Сведения о продавце и условиях продажи будут дополнены до запуска продаж." },
      { heading: "Связаться", text: "Email: khatit12@mail.ru. Вопросы об изделиях также можно направить в Instagram @hatti_brand или Telegram @ankhnb." },
    ],
  },
};

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`wordmark${inverse ? " wordmark--inverse" : ""}`} aria-label="HATTI">
      H<span>A</span>TTI
    </span>
  );
}

function IndexLabel({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return <span className={`index-label${inverse ? " index-label--inverse" : ""}`}>{children}</span>;
}

function getProductOptions(product: Product) {
  return product.sizes ?? product.models ?? [];
}

export function HattiStore({ products, categories }: { products: Product[]; categories: string[] }) {
  const [filter, setFilter] = useState<Filter>("Все");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState<LegalKey | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: true,
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("hatti-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("hatti-cart");
      }
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (cartReady) window.localStorage.setItem("hatti-cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    const overlayOpen = Boolean(selectedProduct || quickAddProduct || cartOpen || menuOpen || legalOpen);
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
        setQuickAddProduct(null);
        setCartOpen(false);
        setMenuOpen(false);
        setLegalOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedProduct, quickAddProduct, cartOpen, menuOpen, legalOpen]);

  const filteredProducts = useMemo(
    () => (filter === "Все" ? products : products.filter((product) => product.category === filter)),
    [filter, products],
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[1] ?? product.models?.[0] ?? "One size");
  };

  const openQuickAdd = (product: Product) => {
    const options = getProductOptions(product);
    if (options.length === 0) {
      addToCart(product, "One size");
      return;
    }
    setSelectedSize(product.sizes?.[1] ?? options[0]);
    setQuickAddProduct(product);
  };

  const addToCart = (product: Product, size: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId: product.id, size, quantity: 1 }];
    });
    setSelectedProduct(null);
    setQuickAddProduct(null);
    setCartOpen(true);
  };

  const updateQuantity = (item: CartItem, delta: number) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.productId === item.productId && entry.size === item.size
            ? { ...entry, quantity: entry.quantity + delta }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeFromCart = (item: CartItem) => {
    setCart((current) =>
      current.filter(
        (entry) => entry.productId !== item.productId || entry.size !== item.size,
      ),
    );
  };

  const copyOrder = async () => {
    const lines = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return `${product?.name} — ${item.size}, ${item.quantity} шт.`;
    });
    await navigator.clipboard.writeText(`Здравствуйте! Меня интересуют изделия HATTI:\n${lines.join("\n")}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell" id="top">
        <header className="site-header">
          <a href="#top" className="logo-link" aria-label="HATTI — на главную">
            <Wordmark />
            <span className="logo-descriptor">National identity</span>
          </a>

          <nav className="desktop-nav" aria-label="Основная навигация">
            <a href="#collection">Коллекция</a>
            <a href="#contact">Контакты</a>
          </nav>

          <div className="header-actions">
            <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Корзина, товаров: ${cartCount}`}>
              <ShoppingBasket className="header-cart-icon" size={19} strokeWidth={1.65} />
              <span>Bag</span>
              <span className="cart-count">{String(cartCount).padStart(2, "0")}</span>
            </button>
            <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
              <Menu size={22} />
            </button>
          </div>
        </header>

        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-type">
              <IndexLabel inverse>HATTI / DROP 01 / 45.03.82</IndexLabel>
              <h1 id="hero-title">
                <span>Circassia</span>
                <span>Present tense</span>
              </h1>
              <div className="hero-dagger">
                <video
                  src="/brand/hatti-dagger.mp4"
                  poster="/brand/hatti-dagger.png"
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Орнаментированный черкесский кинжал"
                />
              </div>
              <p className="hero-intro">Национальная идентичность: твоя опора в мире глобализации.</p>
              <a className="hero-cta hero-cta--desktop" href="#collection">
                Смотреть коллекцию <ArrowDown size={18} />
              </a>
            </div>

            <div className="hero-visual">
              <div className="hero-frame-wrap">
                <div className="hero-image-frame">
                  <Image
                    src="/brand/hatti-emblem-12-stars.png"
                    alt="Белый черкесский символ со звёздами и стрелами на чёрном фоне"
                    fill
                    priority
                    sizes="(max-width: 800px) 92vw, 48vw"
                  />
                </div>
                <span className="frame-coordinate">45.03.82 / 38.89.45</span>
              </div>
              <div className="hero-object-note">
                <span>HATTI / Emblem</span>
                <span>12 stars / 3 arrows</span>
              </div>
            </div>

            <a className="hero-cta hero-cta--mobile" href="#collection">
              Смотреть коллекцию <ArrowDown size={18} />
            </a>

            <a href="#collection" className="hero-scroll" aria-label="Перейти к коллекции">
              Scroll <span />
            </a>
          </section>

          <section className="collection" id="collection" aria-labelledby="collection-title">
            <div className="section-heading">
              <div>
                <IndexLabel>Current drop / {products.length} objects</IndexLabel>
                <h2 id="collection-title">Коллекция</h2>
              </div>
              <p>Выберите изделия и отправьте список бренду, чтобы узнать подробности.</p>
            </div>

            <div className="filters" role="group" aria-label="Фильтр каталога">
              {categories.map((category) => (
                <button
                  key={category}
                  className={filter === category ? "is-active" : ""}
                  onClick={() => setFilter(category)}
                  aria-pressed={filter === category}
                >
                  {category}
                  <span>
                    {category === "Все" ? products.length : products.filter((product) => product.category === category).length}
                  </span>
                </button>
              ))}
            </div>

            <motion.div layout className="product-grid">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.article
                    layout
                    key={product.id}
                    className="product-card"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <button className="product-open" onClick={() => openProduct(product)} aria-label={`Открыть ${product.name}`}>
                      <span className="product-image">
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, 28vw" />
                        <span className="product-arrow"><ArrowUpRight size={19} /></span>
                      </span>
                      <span className="product-info">
                        <span>
                          <span className="product-code">{product.code}</span>
                          <strong>{product.name}</strong>
                        </span>
                        <span className="product-category">{product.category}</span>
                      </span>
                    </button>
                    <button className="product-quick-add" onClick={() => openQuickAdd(product)} aria-label={`Добавить ${product.name} в корзину`}>
                      <ShoppingBasket size={18} strokeWidth={1.6} />
                    </button>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>

        </main>

        <footer className="footer" id="contact">
          <div className="footer-top">
            <Wordmark inverse />
            <div className="footer-socials">
              <a href="https://www.instagram.com/hatti_brand/" target="_blank" rel="noreferrer"><AtSign size={20} /> Instagram: hatti_brand</a>
              <a href="https://t.me/ankhnb" target="_blank" rel="noreferrer"><AtSign size={20} /> Telegram: ankhnb</a>
              <a href="mailto:khatit12@mail.ru"><AtSign size={20} /> khatit12@mail.ru</a>
            </div>
          </div>
          <div className="footer-legal">
            <span>Юридическая информация</span>
            <div>
              {(Object.entries(legalDocuments) as [LegalKey, (typeof legalDocuments)[LegalKey]][]).map(([key, document]) => (
                <button key={key} onClick={() => setLegalOpen(key)}>{document.label}</button>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span>The concept of national identity</span>
            <span>© {new Date().getFullYear()} HATTI</span>
            <a href="#top">Наверх ↑</a>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {legalOpen && (
          <motion.div className="legal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setLegalOpen(null)}>
            <motion.article
              className="legal-modal"
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-modal-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header>
                <IndexLabel>Legal / HATTI</IndexLabel>
                <button onClick={() => setLegalOpen(null)} aria-label="Закрыть юридический документ"><X /></button>
              </header>
              <div className="legal-layout">
                <nav aria-label="Юридические документы">
                  {(Object.entries(legalDocuments) as [LegalKey, (typeof legalDocuments)[LegalKey]][]).map(([key, document]) => (
                    <button key={key} className={legalOpen === key ? "is-active" : ""} onClick={() => setLegalOpen(key)}>{document.label}</button>
                  ))}
                </nav>
                <div className="legal-copy">
                  <h2 id="legal-modal-title">{legalDocuments[legalOpen].title}</h2>
                  {legalDocuments[legalOpen].sections.map((section) => (
                    <section key={section.heading}>
                      <h3>{section.heading}</h3>
                      <p>{section.text}</p>
                    </section>
                  ))}
                  <p className="legal-note">Редакция от 3 октября 2026 года. Сведения описывают текущий каталог для обращений. Перед началом продаж необходимо дополнить сведения о продавце и опубликовать окончательные условия. Описание обработки данных будет уточнено после проверки фактических сервисов и сроков хранения.</p>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="menu-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="overlay-close" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X /></button>
            <nav aria-label="Мобильная навигация">
              {[
                ["Коллекция", "#collection"],
                ["Instagram", "https://www.instagram.com/hatti_brand/"],
                ["Telegram", "https://t.me/ankhnb"],
              ].map(([label, href], index) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                  <span>0{index + 1}</span>{label}<ArrowUpRight />
                </a>
              ))}
            </nav>
            <p>Circassia / Present tense</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickAddProduct && (
          <motion.div className="quick-add-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setQuickAddProduct(null)}>
            <motion.div
              className="quick-add-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-add-title"
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="quick-add-close" onClick={() => setQuickAddProduct(null)} aria-label="Закрыть выбор варианта"><X /></button>
              <div className="quick-add-image"><Image src={quickAddProduct.image} alt="" fill sizes="180px" /></div>
              <div className="quick-add-content">
                <IndexLabel>{quickAddProduct.code}</IndexLabel>
                <h2 id="quick-add-title">{quickAddProduct.name}</h2>
                <fieldset className={`quick-options${quickAddProduct.models ? " quick-options--models" : ""}`}>
                  <legend>{quickAddProduct.models ? "Выберите модель" : "Выберите размер"}</legend>
                  <div>
                    {getProductOptions(quickAddProduct).map((option) => (
                      <button key={option} className={selectedSize === option ? "is-selected" : ""} onClick={() => setSelectedSize(option)}>{option}</button>
                    ))}
                  </div>
                </fieldset>
                <button className="quick-add-confirm" onClick={() => addToCart(quickAddProduct, selectedSize)}>
                  Добавить в корзину <ShoppingBasket size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setSelectedProduct(null)}>
            <motion.div
              className="product-modal"
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Закрыть карточку"><X /></button>
              <div className="modal-image">
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="(max-width: 800px) 100vw, 54vw" />
              </div>
              <div className="modal-content">
                <IndexLabel>{selectedProduct.code}</IndexLabel>
                <h2 id="product-modal-title">{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <dl>
                  <div><dt>Категория</dt><dd>{selectedProduct.category}</dd></div>
                  <div><dt>Цвет</dt><dd>{selectedProduct.color}</dd></div>
                  <div><dt>Цена</dt><dd>По запросу</dd></div>
                </dl>
                {getProductOptions(selectedProduct).length > 0 && (
                  <fieldset className={`size-picker${selectedProduct.models ? " size-picker--models" : ""}`}>
                    <legend>{selectedProduct.models ? "Выберите модель" : "Выберите размер"}</legend>
                    <div>
                      {getProductOptions(selectedProduct).map((option) => (
                        <button key={option} className={selectedSize === option ? "is-selected" : ""} onClick={() => setSelectedSize(option)}>{option}</button>
                      ))}
                    </div>
                  </fieldset>
                )}
                <button className="add-button" onClick={() => addToCart(selectedProduct, selectedSize || "One size")}>
                  Добавить в заявку <ShoppingBag size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button className="drawer-backdrop" aria-label="Закрыть корзину" onClick={() => setCartOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="cart-drawer" aria-label="Корзина" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
              <div className="cart-header">
                <div><IndexLabel>Selected objects</IndexLabel><h2>Заявка / {String(cartCount).padStart(2, "0")}</h2></div>
                <button onClick={() => setCartOpen(false)} aria-label="Закрыть корзину"><X /></button>
              </div>
              <div className="cart-items" data-lenis-prevent>
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingBag size={32} strokeWidth={1.2} />
                    <p>Вы пока ничего не выбрали.</p>
                    <button onClick={() => setCartOpen(false)}>Вернуться к коллекции</button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = products.find((entry) => entry.id === item.productId);
                    if (!product) return null;
                    return (
                      <div className="cart-item" key={`${item.productId}-${item.size}`}>
                        <div className="cart-item-image"><Image src={product.image} alt="" fill sizes="96px" /></div>
                        <div className="cart-item-info">
                          <span>{product.code}</span>
                          <strong>{product.name}</strong>
                          <span>{item.size}</span>
                          <div className="quantity-control">
                            <button onClick={() => updateQuantity(item, -1)} aria-label="Уменьшить количество"><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item, 1)} aria-label="Увеличить количество"><Plus size={14} /></button>
                          </div>
                        </div>
                        <button
                          className="cart-remove"
                          onClick={() => removeFromCart(item)}
                          aria-label={`Удалить ${product.name} из корзины`}
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-footer">
                  <p>Продажи ещё не начались. Напишите, чтобы узнать подробности об изделиях. Не отправляйте адрес или платёжные данные.</p>
                  <button className="copy-button" onClick={copyOrder}>{copied ? <><Check size={17} /> Список скопирован</> : "Скопировать список"}</button>
                  <a href="https://ig.me/m/hatti_brand" target="_blank" rel="noreferrer">
                    Написать в Instagram <ArrowUpRight size={18} />
                  </a>
                  <a href="https://t.me/ankhnb" target="_blank" rel="noreferrer">
                    Написать в Telegram <ArrowUpRight size={18} />
                  </a>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
