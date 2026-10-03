export type ProductCategory = string;

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  color: string;
  image: string;
  code: string;
  description: string;
  sizes?: string[];
  models?: string[];
};

export const initialCategories = ["Футболки", "Обложки", "Чехлы", "Кепки"];

export const products: Product[] = [
  { id: 1, slug: "ticket-black", name: "Билет в Черкесию", category: "Футболки", color: "Чёрный", image: "/products/01_ticket_tshirt_black.png", code: "OBJECT 01 / 1864", description: "Графика дорожного билета как образ памяти, пути и возвращения.", sizes: ["S", "M", "L", "XL"] },
  { id: 2, slug: "green-patch-white", name: "Зелёный знак", category: "Футболки", color: "Белый", image: "/products/02_green_patch_tshirt_white.png", code: "OBJECT 02 / FIELD", description: "Светлая футболка с зелёной эмблемой современной Черкесии.", sizes: ["S", "M", "L", "XL"] },
  { id: 3, slug: "circassian-map-black", name: "Карта Черкесии", category: "Футболки", color: "Чёрный", image: "/products/03_circassian_map_tshirt_black.png", code: "OBJECT 03 / 45.03.82", description: "Координаты и карта превращены в визуальный код национальной идентичности.", sizes: ["S", "M", "L", "XL"] },
  { id: 4, slug: "mountain-stamp-black", name: "Горная печать", category: "Футболки", color: "Чёрный", image: "/products/04_mountain_stamp_tshirt_black.png", code: "OBJECT 04 / RIDGE", description: "Горный силуэт в эстетике архивной печати HATTI.", sizes: ["S", "M", "L", "XL"] },
  { id: 5, slug: "blue-roses-white", name: "Синие цветы", category: "Футболки", color: "Белый", image: "/products/05_blue_roses_tshirt_white.png", code: "OBJECT 05 / BLUE", description: "Цветочный мотив и три стрелы в холодной синей гамме.", sizes: ["S", "M", "L", "XL"] },
  { id: 6, slug: "red-roses-white", name: "Красные цветы", category: "Футболки", color: "Белый", image: "/products/06_red_roses_tshirt_white.png", code: "OBJECT 06 / RED", description: "Красный вариант фирменной цветочной композиции.", sizes: ["S", "M", "L", "XL"] },
  { id: 7, slug: "pink-roses-white", name: "Розовые цветы", category: "Футболки", color: "Белый", image: "/products/07_pink_roses_tshirt_white.png", code: "OBJECT 07 / PINK", description: "Мягкая цветовая версия символического принта HATTI.", sizes: ["S", "M", "L", "XL"] },
  { id: 8, slug: "lavender-roses-white", name: "Лавандовые цветы", category: "Футболки", color: "Белый", image: "/products/08_lavender_roses_tshirt_white.png", code: "OBJECT 08 / LAVENDER", description: "Лавандовый цветочный знак на свободном светлом силуэте.", sizes: ["S", "M", "L", "XL"] },
  { id: 9, slug: "gold-roses-olive", name: "Золотые цветы", category: "Футболки", color: "Оливковый", image: "/products/09_gold_roses_tshirt_olive.png", code: "OBJECT 09 / GOLD", description: "Золотой орнамент на приглушённой оливковой основе.", sizes: ["S", "M", "L", "XL"] },
  { id: 10, slug: "blue-roses-olive", name: "Синие цветы / Olive", category: "Футболки", color: "Оливковый", image: "/products/10_blue_roses_tshirt_olive.png", code: "OBJECT 10 / OLIVE", description: "Контраст синей вышивки и землистой основы.", sizes: ["S", "M", "L", "XL"] },
  { id: 11, slug: "lightblue-roses-blue", name: "Голубые цветы", category: "Футболки", color: "Голубой", image: "/products/11_lightblue_roses_tshirt_blue.png", code: "OBJECT 11 / SKY", description: "Тональная голубая версия для спокойного многослойного образа.", sizes: ["S", "M", "L", "XL"] },
  { id: 12, slug: "pink-roses-pink", name: "Розовые цветы / Rose", category: "Футболки", color: "Розовый", image: "/products/12_pink_roses_tshirt_pink.png", code: "OBJECT 12 / ROSE", description: "Розовый монохром и центральный знак из трёх стрел.", sizes: ["S", "M", "L", "XL"] },
  { id: 13, slug: "circassia-cover-green", name: "Circassia / Green", category: "Обложки", color: "Зелёный", image: "/products/13_cover_circassia_green.png", code: "OBJECT 13 / ARCHIVE", description: "Обложка с горной маркой и фактурой старой почтовой миниатюры." },
  { id: 14, slug: "circassia-cover-burgundy", name: "Circassia / Burgundy", category: "Обложки", color: "Винный", image: "/products/14_cover_circassia_burgundy.png", code: "OBJECT 14 / ARCHIVE", description: "Винная версия обложки из серии Circassia." },
  { id: 15, slug: "circassia-cover-cream", name: "Circassia / Cream", category: "Обложки", color: "Кремовый", image: "/products/15_cover_circassia_cream.png", code: "OBJECT 15 / ARCHIVE", description: "Светлая версия обложки с графикой горного хребта." },
  { id: 16, slug: "topographic-case", name: "Topographic Case", category: "Чехлы", color: "Чёрный", image: "/products/16_iphone15pro_topographic_case.png", code: "OBJECT 16 / TERRAIN", description: "Чехол для iPhone 15 Pro с топографической графикой.", models: ["iPhone 13", "iPhone 14", "iPhone 15", "iPhone 15 Pro"] },
  { id: 17, slug: "freedom-case", name: "Freedom Case", category: "Чехлы", color: "Чёрный", image: "/products/17_iphone15pro_freedom_case.png", code: "OBJECT 17 / FREEDOM", description: "Чехол для iPhone 15 Pro с типографикой Freedom.", models: ["iPhone 13", "iPhone 14", "iPhone 15", "iPhone 15 Pro"] },
  { id: 18, slug: "freedom-or-death-cap", name: "Freedom or Death", category: "Кепки", color: "Чёрный", image: "/products/18_cap_freedom_or_death.png", code: "OBJECT 18 / FREEDOM", description: "Чёрная кепка с объёмной контрастной вышивкой." },
  { id: 19, slug: "mcga-cap", name: "Make Circassia Great Again", category: "Кепки", color: "Чёрный", image: "/products/19_cap_make_circassia_great_again.png", code: "OBJECT 19 / MCGA", description: "Ироничный манифест HATTI в формате вышитой кепки." },
  { id: 20, slug: "circassian-vibe-cap", name: "Circassian Vibe", category: "Кепки", color: "Чёрный", image: "/products/20_cap_circassian_vibe.png", code: "OBJECT 20 / VIBE", description: "Повседневная кепка с фирменной надписью Circassian Vibe." }
];
