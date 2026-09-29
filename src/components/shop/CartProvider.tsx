"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PLACEHOLDER_IMAGE, type Product, type StockStatus } from "@/content/products";

/** What the cart needs to show a line; stored with the line so it renders before live data arrives. */
export type CartProduct = Pick<Product, "slug" | "name" | "condition" | "image" | "price">;
type Stored = { slug: string; qty: number; snap?: CartProduct };
type Live = CartProduct & { available: number; status: StockStatus };
/** `problem` is set when live stock can no longer cover this line (reserved by someone else, sold out, removed). */
export type CartLine = { slug: string; qty: number; product: CartProduct; price: number; max: number; problem: null | "reserved" | "sold-out" | "limited" };

type CartContext = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  hasProblems: boolean;
  isOpen: boolean;
  add: (product: CartProduct, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  refreshStock: () => Promise<void>;
};

const STORAGE_KEY = "cad-cart-v1";
const MAX_PER_ITEM = 5;
const Ctx = createContext<CartContext | null>(null);

function sanitize(raw: unknown): Stored[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((l) => {
    const qty = Math.floor(Number(l?.qty));
    if (typeof l?.slug !== "string" || !(qty > 0)) return [];
    const s = l.snap;
    const snap =
      s && typeof s.name === "string" && typeof s.price === "number" && typeof s.image?.src === "string"
        ? { slug: l.slug, name: s.name, condition: s.condition, image: { src: s.image.src, alt: String(s.image.alt ?? "") }, price: s.price }
        : undefined;
    return [{ slug: l.slug.slice(0, 80), qty: Math.min(qty, MAX_PER_ITEM), snap }];
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Stored[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [live, setLive] = useState<Record<string, Live> | null>(null);

  const refreshStock = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) setLive(await res.json());
    } catch {
      /* offline: keep the last known stock */
    }
  }, []);

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

  // Load stock once, then re-check whenever the drawer opens so other customers' reservations show up.
  useEffect(() => {
    void refreshStock();
  }, [refreshStock]);
  useEffect(() => {
    if (isOpen) void refreshStock();
  }, [isOpen, refreshStock]);

  /** Max units for a product: live availability when known, otherwise the per-item cap. */
  const maxFor = useCallback((slug: string) => Math.min(live ? (live[slug]?.available ?? 0) : MAX_PER_ITEM, MAX_PER_ITEM), [live]);

  const setQty = useCallback(
    (slug: string, qty: number) => {
      setItems((prev) => {
        const clamped = Math.max(0, Math.min(Math.floor(qty), maxFor(slug)));
        if (clamped === 0) return prev.filter((l) => l.slug !== slug);
        return prev.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l));
      });
    },
    [maxFor],
  );

  const add = useCallback(
    (product: CartProduct, qty = 1) => {
      setItems((prev) => {
        const max = maxFor(product.slug);
        if (max < 1) return prev;
        const current = prev.find((l) => l.slug === product.slug);
        const next = Math.min((current?.qty ?? 0) + qty, max);
        const snap = { slug: product.slug, name: product.name, condition: product.condition, image: product.image, price: product.price };
        return current ? prev.map((l) => (l.slug === product.slug ? { ...l, qty: next, snap } : l)) : [...prev, { slug: product.slug, qty: next, snap }];
      });
      setIsOpen(true);
    },
    [maxFor],
  );

  const value = useMemo<CartContext>(() => {
    const lines: CartLine[] = items.map((l) => {
      const stock = live?.[l.slug];
      const product: CartProduct = stock ?? l.snap ?? { slug: l.slug, name: "Item", condition: "New", image: PLACEHOLDER_IMAGE, price: 0 };
      // Until live data loads, trust the line; once loaded, a missing product means it was archived or removed.
      const available = live ? (stock?.available ?? 0) : MAX_PER_ITEM;
      const problem: CartLine["problem"] =
        available === 0 ? (stock?.status === "reserved" ? "reserved" : "sold-out") : l.qty > available ? "limited" : null;
      return { slug: l.slug, qty: l.qty, product, price: product.price, max: Math.min(available, MAX_PER_ITEM), problem };
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      ready,
      hasProblems: lines.some((l) => l.problem),
      isOpen,
      add,
      setQty,
      remove: (slug) => setItems((prev) => prev.filter((l) => l.slug !== slug)),
      clear: () => setItems([]),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      refreshStock,
    };
  }, [items, live, ready, isOpen, add, setQty, refreshStock]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export const problemText: Record<NonNullable<CartLine["problem"]>, (line: CartLine) => string> = {
  reserved: () => "Just reserved by another customer. Remove it to check out.",
  "sold-out": () => "No longer available. Remove it to check out.",
  limited: (line) => `Only ${line.max} available now. Lower the quantity to check out.`,
};
