"use client";

import { ArrowRight, ShoppingBagOpen, Trash, Warning, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { money } from "@/content/products";
import { problemText, useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { lines, count, subtotal, hasProblems, isOpen, close, setQty, remove } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="cart-title"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="display text-2xl">
            Your cart <span className="font-mono text-base text-fog">({count})</span>
          </h2>
          <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full text-fog hover:text-white" aria-label="Close cart">
            <X size={22} aria-hidden />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBagOpen size={48} className="text-line-2" aria-hidden />
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-fog">Phones, laptops, consoles and accessories, all tested in our shop.</p>
            <Link href="/shop" onClick={close} className="btn btn-primary mt-2">
              Browse the shop <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => {
                const { product, qty, price } = line;
                const href = `/shop/${product.slug}`;
                return (
                <li key={product.slug} className="flex gap-4 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-panel-2">
                    <Image src={product.image.src} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={href} onClick={close} className="font-semibold leading-snug hover:text-signal-hot">
                        {product.name}
                      </Link>
                      <span className="font-mono text-sm tabular-nums">{money(price * qty)}</span>
                    </div>
                    <span className="text-xs text-fog">{product.condition}</span>
                    <div className="flex items-center justify-between">
                      <QtyStepper value={qty} max={Math.max(line.max, 1)} onChange={(n) => setQty(product.slug, n)} label={product.name} />
                      <button type="button" onClick={() => remove(product.slug)} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-fog hover:text-danger">
                        <Trash size={16} aria-hidden /> Remove
                      </button>
                    </div>
                    {line.problem && (
                      <p className="flex items-start gap-1.5 text-sm text-danger" role="alert">
                        <Warning size={16} className="mt-0.5 shrink-0" aria-hidden /> {problemText[line.problem](line)}
                      </p>
                    )}
                  </div>
                </li>
                );
              })}
            </ul>
            <div className="border-t border-line px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-fog">Subtotal</span>
                <span className="font-mono text-xl tabular-nums">{money(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-fog">Reserve online, pay in store when you pick up.</p>
              {hasProblems ? (
                <button type="button" className="btn btn-primary mt-4 w-full" disabled>
                  Fix cart items to check out
                </button>
              ) : (
                <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
                  Checkout <ArrowRight size={16} weight="bold" aria-hidden />
                </Link>
              )}
              <button type="button" onClick={close} className="btn btn-ghost mt-2 w-full">
                Keep shopping
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
