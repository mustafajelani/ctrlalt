import Image from "next/image";
import Link from "next/link";
import { money, type Product } from "@/content/products";
import { AddToCartButton } from "./AddToCartButton";

export const conditionStyle: Record<Product["condition"], string> = {
  New: "bg-signal/15 text-signal-hot",
  Refurbished: "bg-ok/10 text-ok",
  "Pre-owned": "bg-white/8 text-mist",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const inStock = product.stock > 0;
  return (
    <article
      data-reveal
      style={{ "--i": index % 4 } as React.CSSProperties}
      className="group card relative flex flex-col overflow-hidden transition-colors duration-300 hover:border-signal/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <span className={`badge absolute top-3 left-3 backdrop-blur ${conditionStyle[product.condition]}`}>{product.condition}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-semibold leading-snug">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-signal-hot">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-fog">{product.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-mono text-lg tabular-nums">{money(product.price)}</span>
          <div className="relative z-10">
            <AddToCartButton slug={product.slug} inStock={inStock} className="btn btn-ghost btn-sm" />
          </div>
        </div>
      </div>
    </article>
  );
}
