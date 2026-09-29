"use client";

import { Check, ShoppingCartSimple } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { useCart, type CartProduct } from "./CartProvider";

export function AddToCartButton({
  product,
  qty = 1,
  inStock,
  unavailableLabel = "Out of stock",
  className = "btn btn-primary",
}: {
  product: CartProduct;
  qty?: number;
  inStock: boolean;
  unavailableLabel?: string;
  className?: string;
}) {
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
        {unavailableLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        add(product, qty);
        setAdded(true);
      }}
    >
      {added ? <Check size={16} weight="bold" aria-hidden /> : <ShoppingCartSimple size={16} weight="bold" aria-hidden />}
      <span aria-live="polite">{added ? "Added" : "Add to cart"}</span>
    </button>
  );
}
