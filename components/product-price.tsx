import type { Product } from "@/data/products";
import { discountPercent, formatPrice, priceLabel } from "@/lib/product-display";

export function ProductPrice({ product }: { product: Product }) {
  if (product.show_price === false) return null;
  const discount = discountPercent(product);
  return <span className={`product-price${product.price ? "" : " product-price--request"}`}>
    <span className="product-price-current">{priceLabel(product)}</span>
    {product.price && product.old_price && product.old_price > product.price ? <span className="product-price-history">
      <s aria-label={`Старая цена ${formatPrice(product.old_price)}`}>{formatPrice(product.old_price)}</s>
      {discount > 0 && <span className="product-discount" aria-label={`Скидка ${discount} процентов`}>−{discount}%</span>}
    </span> : null}
  </span>;
}
