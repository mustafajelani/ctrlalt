import Image from "next/image";
import Link from "next/link";
import { cartSnapshot, money, type Product, type StockStatus } from "@/content/products";
import { AddToCartButton } from "./AddToCartButton";

// These badges sit on product photos, so they need a solid dark backing to stay readable on light images.
export const conditionStyle: Record<Product["condition"], string> = {
  New: "bg-ink/85 text-signal-hot ring-1 ring-inset ring-signal/40",
  Refurbished: "bg-ink/85 text-ok ring-1 ring-inset ring-ok/35",
  "Pre-owned": "bg-ink/85 text-mist ring-1 ring-inset ring-white/15",
};

export const stockLabel: Record<StockStatus, string> = { available: "Add to cart", reserved: "Reserved", "sold-out": "Out of stock" };

export function productStatus(product: Product): StockStatus {
  return product.status ?? (product.stock > 0 ? "available" : "sold-out");
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const status = productStatus(product);
  const inStock = status === "available";
  return (
    <article
      data-reveal
      style={{ "--i": index % 4 } as React.CSSProperties}
      data-link-card
      className="group card relative flex flex-col overflow-hidden transition-colors duration-300 hover:border-signal/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <span className={`badge absolute top-2.5 left-2.5 backdrop-blur sm:top-3 sm:left-3 ${conditionStyle[product.condition]}`}>{product.condition}</span>
        {!inStock && (
          <span className="badge absolute top-2.5 right-2.5 bg-ink/85 text-mist backdrop-blur sm:top-3 sm:right-3">{stockLabel[status]}</span>
        )}
      </div>
      {/* Phones show two cards per row: summary hidden, price above a full-width button. */}
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:gap-3 sm:p-5">
        <h3 className="line-clamp-2 text-sm leading-snug sm:text-base">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-signal-hot">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 hidden text-sm text-fog sm:block">{product.summary}</p>
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-2">
          <span className="font-mono text-base tabular-nums sm:text-lg">{money(product.price)}</span>
          <div className="relative z-10">
            <AddToCartButton
              product={cartSnapshot(product)}
              inStock={inStock}
              unavailableLabel={stockLabel[status]}
              className="btn btn-ghost btn-sm w-full px-3 sm:w-auto sm:px-4"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
