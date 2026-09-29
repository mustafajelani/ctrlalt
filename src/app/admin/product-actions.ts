"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories, conditions, type Condition, type ProductImage } from "@/content/products";
import { requireAdmin } from "@/lib/auth";
import { HOLDING_STATUSES, MAX_PHOTOS, PRODUCTS_TAG } from "@/lib/catalog";
import { sql } from "@/lib/db";
import { deleteImages, isAllowedImage } from "@/lib/images";
import { text } from "@/lib/validate";
import { safeBack, withParam } from "./nav";

export type SaveProductState = { error: string; field?: string } | undefined;

const LIST = "/admin?tab=products";

function refresh() {
  updateTag(PRODUCTS_TAG);
  revalidatePath("/admin");
}

function parsePrice(v: FormDataEntryValue | null) {
  const n = Number(text(v, 12));
  return Number.isFinite(n) && n >= 0 && n <= 100000 ? Math.round(n * 100) / 100 : null;
}

function parseQuantity(v: FormDataEntryValue | null) {
  const n = Number(text(v, 6));
  return Number.isInteger(n) && n >= 0 && n <= 9999 ? n : null;
}

async function uniqueSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";
  const rows = await sql!`SELECT slug FROM products WHERE slug = ${base} OR slug LIKE ${`${base}-%`}`;
  const taken = new Set(rows.map((r) => r.slug as string));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Create or fully edit a product from the editor form. Returns an error for the form, or redirects on success. */
export async function saveProduct(_prev: SaveProductState, formData: FormData): Promise<SaveProductState> {
  await requireAdmin();
  if (!sql) return { error: "The database isn't connected." };

  const editing = formData.get("mode") === "edit";
  const name = text(formData.get("name"), 120);
  if (name.length < 2) return { error: "Enter a product name.", field: "name" };
  const category = text(formData.get("category"), 20);
  if (!categories.some((c) => c.key !== "all" && c.key === category)) return { error: "Choose a category.", field: "category" };
  const condition = text(formData.get("condition"), 20) as Condition;
  if (!conditions.includes(condition)) return { error: "Choose a condition.", field: "condition" };
  const price = parsePrice(formData.get("price"));
  if (price === null) return { error: "Enter a price between $0 and $100,000.", field: "price" };
  const quantity = parseQuantity(formData.get("quantity"));
  if (quantity === null) return { error: "Enter a whole number of units, from 0 to 9999.", field: "quantity" };
  const summary = text(formData.get("summary"), 500);
  const specs = text(formData.get("specs"), 2000)
    .split("\n")
    .map((s) => s.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 12);
  const inStock = formData.get("in_stock") === "on";
  const featured = formData.get("featured") === "on";

  let images: ProductImage[];
  try {
    const raw: unknown = JSON.parse(text(formData.get("images"), 20000) || "[]");
    if (!Array.isArray(raw) || raw.length > MAX_PHOTOS) throw new Error("bad list");
    images = raw.map((i) => {
      const src = String(i?.src ?? "");
      if (!isAllowedImage(src)) throw new Error("bad src");
      return { src, alt: String(i?.alt ?? "").trim().slice(0, 150) };
    });
  } catch {
    return { error: "One of the photos couldn't be saved. Remove it and upload it again.", field: "images" };
  }
  const imagesJson = JSON.stringify(images);

  let slug: string;
  if (editing) {
    slug = text(formData.get("slug"), 80);
    const [prev] = await sql`SELECT images FROM products WHERE slug = ${slug}`;
    if (!prev) return { error: "This product no longer exists." };
    await sql`
      UPDATE products SET name = ${name}, category = ${category}, condition = ${condition}, summary = ${summary}, specs = ${specs},
        images = ${imagesJson}::jsonb, price = ${price}, quantity = ${quantity}, in_stock = ${inStock}, featured = ${featured},
        -- Newly featured products go to the front of the home page; already-featured ones keep their place.
        featured_at = CASE WHEN ${featured}::boolean THEN COALESCE(CASE WHEN featured THEN featured_at END, now()) END,
        updated_at = now()
      WHERE slug = ${slug}`;
    const kept = new Set(images.map((i) => i.src));
    await deleteImages((prev.images as ProductImage[]).map((i) => i.src).filter((s) => !kept.has(s)));
  } else {
    slug = await uniqueSlug(name);
    try {
      await sql`
        INSERT INTO products (slug, name, category, condition, summary, specs, images, price, quantity, in_stock, featured, featured_at, sort_order)
        VALUES (${slug}, ${name}, ${category}, ${condition}, ${summary}, ${specs}, ${imagesJson}::jsonb, ${price}, ${quantity}, ${inStock}, ${featured},
          ${featured ? new Date() : null},
          (SELECT COALESCE(MAX(sort_order), 0) + 10 FROM products))`;
    } catch (err) {
      console.error("product insert failed", err);
      return { error: "Couldn't create the product. Please try again." };
    }
  }

  await discardUnused(formData.get("discarded"));
  refresh();
  redirect(withParam(LIST, "saved", slug));
}

/** Photos uploaded in the editor but removed before saving: delete them unless some product still uses them. */
async function discardUnused(value: FormDataEntryValue | null) {
  let srcs: string[];
  try {
    const raw: unknown = JSON.parse(text(value, 20000) || "[]");
    srcs = Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && isAllowedImage(s)).slice(0, 50) : [];
  } catch {
    return;
  }
  if (!srcs.length || !sql) return;
  const used = await sql`
    SELECT DISTINCT i->>'src' AS src FROM products, jsonb_array_elements(images) i WHERE i->>'src' = ANY(${srcs})`;
  const inUse = new Set(used.map((r) => r.src as string));
  await deleteImages(srcs.filter((s) => !inUse.has(s)));
}

/** Quick inline edit of price and units on hand from the products list. */
export async function updateProductStock(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const back = safeBack(formData.get("back"), LIST);
  const slug = text(formData.get("slug"), 80);
  const price = parsePrice(formData.get("price"));
  const quantity = parseQuantity(formData.get("quantity"));
  if (price === null || quantity === null) redirect(withParam(back, "error", "product"));
  await sql`UPDATE products SET price = ${price}, quantity = ${quantity}, updated_at = now() WHERE slug = ${slug}`;
  refresh();
  redirect(withParam(back, "saved", slug));
}

export async function setProductInStock(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const slug = text(formData.get("slug"), 80);
  await sql`UPDATE products SET in_stock = ${formData.get("in_stock") === "true"}, updated_at = now() WHERE slug = ${slug}`;
  refresh();
  redirect(safeBack(formData.get("back"), LIST));
}

/** Archived products disappear from the shop but keep their history; reversible. */
export async function setProductArchived(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const slug = text(formData.get("slug"), 80);
  await sql`UPDATE products SET archived = ${formData.get("archived") === "true"}, updated_at = now() WHERE slug = ${slug}`;
  refresh();
  redirect(safeBack(formData.get("back"), LIST));
}

/** Permanent delete. Refused while any active order still holds the product (release it first). */
export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const slug = text(formData.get("slug"), 80);
  const [held] = await sql`
    SELECT 1 FROM orders o, jsonb_array_elements(o.items) i
    WHERE o.status = ANY(${[...HOLDING_STATUSES]}) AND i->>'slug' = ${slug} LIMIT 1`;
  if (held) redirect(`/admin/products/${encodeURIComponent(slug)}?error=held`);

  const [row] = await sql`DELETE FROM products WHERE slug = ${slug} RETURNING name, images`;
  if (row) await deleteImages((row.images as ProductImage[]).map((i) => i.src));
  refresh();
  redirect(withParam(LIST, "deleted", row?.name ?? slug));
}
