"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { productBySlug, type Product } from "@/content/products";

type Line = { slug: string; qty: number };
export type CartLine = Line & { product: Product };

type CartContext = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const STORAGE_KEY = "cad-cart-v1";
const Ctx = createContext<CartContext | null>(null);

export const maxQty = (p: Product) => Math.min(p.stock, 5);

function sanitize(raw: unknown): Line[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((l) => {
    const product = typeof l?.slug === "string" ? productBySlug(l.slug) : undefined;
    const qty = Math.floor(Number(l?.qty));
    if (!product || !(qty > 0) || product.stock < 1) return [];
    return [{ slug: product.slug, qty: Math.min(qty, maxQty(product)) }];
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      setItems(sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")));
    } catch {
      /* storage unavailable: start with an empty cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart lives in memory only */
    }
  }, [items, ready]);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) => {
      const product = productBySlug(slug);
      if (!product) return prev;
      const clamped = Math.max(0, Math.min(Math.floor(qty), maxQty(product)));
      if (clamped === 0) return prev.filter((l) => l.slug !== slug);
      return prev.some((l) => l.slug === slug)
        ? prev.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l))
        : [...prev, { slug, qty: clamped }];
    });
  }, []);

  const add = useCallback(
    (slug: string, qty = 1) => {
      setItems((prev) => {
        const product = productBySlug(slug);
        if (!product) return prev;
        const current = prev.find((l) => l.slug === slug)?.qty ?? 0;
        const next = Math.min(current + qty, maxQty(product));
        return current
          ? prev.map((l) => (l.slug === slug ? { ...l, qty: next } : l))
          : [...prev, { slug, qty: next }];
      });
      setIsOpen(true);
    },
    [],
  );

  const value = useMemo<CartContext>(() => {
    const lines = items.flatMap((l) => {
      const product = productBySlug(l.slug);
      return product ? [{ ...l, product }] : [];
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      ready,
      isOpen,
      add,
      setQty,
      remove: (slug) => setItems((prev) => prev.filter((l) => l.slug !== slug)),
      clear: () => setItems([]),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, ready, isOpen, add, setQty]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
