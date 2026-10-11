import type { ProductImage } from "@/data/products";

// Descriptions verified against the original photographs, not catalog color fields.
// Uploaded photographs keep the descriptions entered in the catalog editor.
const originalImageAlt: Record<string, string> = {
  "/products/01_ticket_tshirt_black.png": "Чёрная футболка HATTI с принтом дорожного билета, вид спереди",
  "/products/02_green_patch_tshirt_white.png": "Белая футболка HATTI с небольшой зелёной эмблемой, вид спереди",
  "/products/03_circassian_map_tshirt_black.png": "Чёрная футболка HATTI с картой и надписью Circassian, вид спереди",
  "/products/04_mountain_stamp_tshirt_black.png": "Чёрная футболка HATTI с изображением горы в почтовой марке, вид спереди",
  "/products/05_blue_roses_tshirt_white.png": "Белая футболка HATTI с синими цветами и стрелами, вид спереди",
  "/products/06_red_roses_tshirt_white.png": "Белая футболка HATTI с красными цветами и стрелами, вид спереди",
  "/products/07_pink_roses_tshirt_white.png": "Белая футболка HATTI с розовыми цветами и стрелами, вид спереди",
  "/products/08_lavender_roses_tshirt_white.png": "Белая футболка HATTI с лавандовыми цветами и стрелами, вид спереди",
  "/products/09_gold_roses_tshirt_olive.png": "Оливковая футболка HATTI с золотистыми цветами и стрелами, вид спереди",
  "/products/10_blue_roses_tshirt_olive.png": "Оливковая футболка HATTI с синими цветами и оранжевыми стрелами, вид спереди",
  "/products/11_lightblue_roses_tshirt_blue.png": "Голубая футболка HATTI со светло-голубыми цветами и оранжевыми стрелами, вид спереди",
  "/products/12_pink_roses_tshirt_pink.png": "Розовая футболка HATTI с розовыми цветами и зелёными стрелами, вид спереди",
  "/products/13_cover_circassia_green.png": "Обложка HATTI с горой и надписью Circassia на зелёном фоне",
  "/products/14_cover_circassia_burgundy.png": "Обложка HATTI с горой и надписью Circassia на бордовом фоне",
  "/products/15_cover_circassia_cream.png": "Обложка HATTI с горой и надписью Circassia на кремовом фоне",
  "/products/16_iphone15pro_topographic_case.png": "Чёрный чехол HATTI с топографическими линиями и красным контуром, вид сзади",
  "/products/17_iphone15pro_freedom_case.png": "Чёрный чехол HATTI с надписью Freedom or Death и кинжалами, вид сзади",
  "/products/18_cap_freedom_or_death.png": "Чёрная кепка HATTI с надписью Freedom or Death, вид спереди",
  "/products/19_cap_make_circassia_great_again.png": "Чёрная кепка HATTI с надписью Make Circassia Great Again, вид спереди",
  "/products/20_cap_circassian_vibe.png": "Бежевая кепка HATTI с надписью Circassian Vibe, вид спереди",
};

export function productImageAlt(image: ProductImage, productName: string, index: number) {
  if (image.alt && image.alt !== productName) return image.alt;
  return originalImageAlt[image.src] ?? (image.alt || `${productName} — фото ${index + 1}`);
}
