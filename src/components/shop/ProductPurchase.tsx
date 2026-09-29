"use client";

import { useState } from "react";
import type { StockStatus } from "@/content/products";
import { AddToCartButton } from "./AddToCartButton";
import type { CartProduct } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function ProductPurchase({ product, stock, status }: { product: CartProduct; stock: number; status: StockStatus }) {
  const [qty, setQty] = useState(1);
  const max = Math.min(stock, 5);
  const available = status === "available";
  return (
    <div className="flex flex-wrap items-center gap-3">
      {available && <QtyStepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(n, max)))} label="this product" />}
      <AddToCartButton
        product={product}
        qty={qty}
        inStock={available}
        unavailableLabel={status === "reserved" ? "Reserved" : "Out of stock"}
        className="btn btn-primary min-w-44 flex-1 sm:flex-none"
      />
    </div>
  );
}
