"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { QtyStepper } from "./QtyStepper";

export function ProductPurchase({ slug, stock }: { slug: string; stock: number }) {
  const [qty, setQty] = useState(1);
  const max = Math.min(stock, 5);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {stock > 0 && <QtyStepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(n, max)))} label="this product" />}
      <AddToCartButton slug={slug} qty={qty} inStock={stock > 0} className="btn btn-primary min-w-44 flex-1 sm:flex-none" />
    </div>
  );
}
