import { unstable_cache } from "next/cache";
import type { PoolClient } from "pg";
import { PLACEHOLDER_IMAGE, seedProducts, type Category, type Condition, type Product, type ProductImage, type StockStatus } from "@/content/products";
import { sql } from "./db";

/** Tag on every cached storefront read of products; admin edits and new orders expire it. */
export const PRODUCTS_TAG = "products";
/** Orders in these statuses hold (reserve) their items. */
export const HOLDING_STATUSES = ["reserved", "ready"] as const;
export const MAX_PHOTOS = 7;

/** Full product record as the admin sees it. `stock` is what customers can still reserve. */
export type AdminProduct = Product & {
  quantity: number;
  held: number;
  inStock: boolean;
  archived: boolean;
  status: StockStatus;
};

export function stockStatus(inStock: boolean, quantity: number, held: number): { available: number; status: StockStatus } {
  const available = inStock ? Math.max(0, quantity - held) : 0;
  const status: StockStatus = available > 0 ? "available" : inStock && quantity > 0 && held > 0 ? "reserved" : "sold-out";
  return { available, status };
}

function build(p: {
  slug: string;
  name: string;
  category: Category;
  condition: Condition;
  summary: string;
  specs: string[];
  images: ProductImage[];
  price: number;
  quantity: number;
  inStock: boolean;
  featured: boolean;
  archived: boolean;
  held: number;
}): AdminProduct {
  const { available, status } = stockStatus(p.inStock, p.quantity, p.held);
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    condition: p.condition,
    summary: p.summary,
    specs: p.specs,
    images: p.images,
    image: p.images[0] ?? PLACEHOLDER_IMAGE,
    price: p.price,
    featured: p.featured,
    quantity: p.quantity,
    held: p.held,
    inStock: p.inStock,
    archived: p.archived,
    stock: available,
    status,
  };
}

const HOLDS_QUERY = `
  SELECT i->>'slug' AS slug, SUM((i->>'qty')::int)::int AS held
  FROM orders o, jsonb_array_elements(o.items) i
  WHERE o.status = ANY($1)`;

/** Uncached: every product (archived too) with live holds. Admin uses this directly. */
export async function loadAllProducts(): Promise<AdminProduct[]> {
  if (!sql) {
    // No database configured: show the starter catalog as a read-only demo.
    return seedProducts.map((p) =>
      build({ ...p, images: [p.image], quantity: p.stock, inStock: true, featured: !!p.featured, archived: false, held: 0 }),
    );
  }
  try {
    const [rows, holds] = await Promise.all([
      sql`SELECT slug, name, category, condition, summary, specs, images, price::float8 AS price, quantity, in_stock, featured, archived
          FROM products ORDER BY sort_order, created_at`,
      sql`
        SELECT i->>'slug' AS slug, SUM((i->>'qty')::int)::int AS held
        FROM orders o, jsonb_array_elements(o.items) i
        WHERE o.status = ANY(${[...HOLDING_STATUSES]})
        GROUP BY 1`,
    ]);
    const heldBy = new Map(holds.map((h) => [h.slug as string, h.held as number]));
    return rows.map((r) =>
      build({
        slug: r.slug,
        name: r.name,
        category: r.category,
        condition: r.condition,
        summary: r.summary,
        specs: r.specs ?? [],
        images: Array.isArray(r.images) ? r.images : [],
        price: Number(r.price),
        quantity: r.quantity,
        inStock: r.in_stock,
        featured: r.featured,
        archived: r.archived,
        held: heldBy.get(r.slug) ?? 0,
      }),
    );
  } catch (err) {
    // Never fall back to demo products when a real database is configured: an empty shop is safer than fake stock.
    console.error("product load failed", err);
    return [];
  }
}

function toShopProduct(p: AdminProduct): Product {
  const { quantity: _q, held: _h, inStock: _i, archived: _a, ...shop } = p;
  return shop;
}

/** Cached storefront catalog: listed (non-archived) products with price and reservable stock. */
export const getShopProducts = unstable_cache(
  async (): Promise<Product[]> => (await loadAllProducts()).filter((p) => !p.archived).map(toShopProduct),
  ["shop-products-v2"],
  { tags: [PRODUCTS_TAG], revalidate: 300 },
);

export async function getShopProduct(slug: string) {
  return (await getShopProducts()).find((p) => p.slug === slug);
}

export type LockedProduct = { slug: string; name: string; condition: string; price: number; quantity: number; inStock: boolean; archived: boolean; held: number };

/**
 * Inside a transaction: lock the given products (in slug order, so concurrent checkouts queue instead of
 * deadlocking or double-booking) and return them with their current holds.
 */
export async function lockProducts(tx: PoolClient, slugs: string[]): Promise<Map<string, LockedProduct>> {
  const sorted = [...new Set(slugs)].sort();
  const { rows } = await tx.query(
    `SELECT slug, name, condition, price::float8 AS price, quantity, in_stock, archived
     FROM products WHERE slug = ANY($1) ORDER BY slug FOR UPDATE`,
    [sorted],
  );
  const { rows: holds } = await tx.query(`${HOLDS_QUERY} AND i->>'slug' = ANY($2) GROUP BY 1`, [[...HOLDING_STATUSES], sorted]);
  const heldBy = new Map(holds.map((h) => [h.slug as string, h.held as number]));
  return new Map(
    rows.map((r) => [
      r.slug as string,
      { slug: r.slug, name: r.name, condition: r.condition, price: Number(r.price), quantity: r.quantity, inStock: r.in_stock, archived: r.archived, held: heldBy.get(r.slug) ?? 0 },
    ]),
  );
}
