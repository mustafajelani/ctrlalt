"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { categories, type Category, type Condition, type Product } from "@/content/products";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc";
const conditions: Condition[] = ["New", "Refurbished", "Pre-owned"];

export function ShopBrowser({ products, initialCategory }: { products: Product[]; initialCategory: Category | "all" }) {
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!condition || p.condition === condition) &&
        (!q || `${p.name} ${p.summary} ${p.specs.join(" ")}`.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [products, category, condition, query, sort]);

  function pickCategory(key: Category | "all") {
    setCategory(key);
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", key);
    history.replaceState(null, "", url);
  }

  const filtered = category !== "all" || condition || query;

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
          {categories.map((c) => (
            <button key={c.key} type="button" className="chip shrink-0" aria-pressed={category === c.key} onClick={() => pickCategory(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block sm:w-64">
            <span className="sr-only">Search products</span>
            <MagnifyingGlass size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fog" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="input pl-10" />
          </label>
          <label className="block sm:w-48">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Condition">
        <span className="mr-1 font-mono text-xs tracking-[0.14em] text-fog uppercase">Condition</span>
        {conditions.map((c) => (
          <button key={c} type="button" className="chip !min-h-9 !py-1 text-sm" aria-pressed={condition === c} onClick={() => setCondition(condition === c ? null : c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-b border-line pb-4">
        <p className="text-sm text-fog" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>
        {filtered && (
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 text-sm text-fog hover:text-white"
            onClick={() => {
              pickCategory("all");
              setCondition(null);
              setQuery("");
            }}
          >
            <X size={14} aria-hidden /> Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-lg font-semibold">Nothing matches those filters</p>
          <p className="max-w-md text-fog">Inventory changes fast. Call us to ask about something specific, or clear the filters to see everything.</p>
        </div>
      )}
    </div>
  );
}
