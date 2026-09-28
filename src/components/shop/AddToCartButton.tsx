"use client";

import { Check, ShoppingCartSimple } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({ slug, qty = 1, inStock, className = "btn btn-primary" }: { slug: string; qty?: number; inStock: boolean; className?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(id);
  }, [added]);

  if (!inStock) {
    return (
      <button type="button" className={className} disabled>
        Sold out
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        add(slug, qty);
        setAdded(true);
      }}
    >
      {added ? <Check size={16} weight="bold" aria-hidden /> : <ShoppingCartSimple size={16} weight="bold" aria-hidden />}
      <span aria-live="polite">{added ? "Added" : "Add to cart"}</span>
    </button>
  );
}
