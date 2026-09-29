import { ArrowSquareOut, PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { releaseOrder } from "@/app/admin/actions";
import { setProductInStock, updateProductStock } from "@/app/admin/product-actions";
import { categories, money, type StockStatus } from "@/content/products";
import { HOLDING_STATUSES, homeFeatured, loadAllProducts, type AdminProduct } from "@/lib/catalog";
import { sql } from "@/lib/db";
import { site } from "@/lib/site";
import { ConfirmRelease } from "./ConfirmDelete";

type Filter = "all" | StockStatus | "archived";
const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Listed" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "sold-out", label: "Out of stock" },
  { key: "archived", label: "Archived" },
];

const statusBadge: Record<StockStatus, string> = {
  available: "bg-ok/12 text-ok",
  reserved: "bg-signal/15 text-signal-hot",
  "sold-out": "bg-danger/12 text-danger",
};

const matches = (p: AdminProduct, f: Filter) => (f === "archived" ? p.archived : !p.archived && (f === "all" || p.status === f));

const fmt = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", { timeZone: site.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export async function ProductsTab({ filter: requested, saved, deleted, error }: { filter?: string; saved?: string; deleted?: string; error?: string }) {
  const filter = filters.find((f) => f.key === requested)?.key ?? "all";
  const [products, holds] = await Promise.all([
    loadAllProducts(),
    sql!`
      SELECT o.id, o.name, o.status, o.created_at, i->>'slug' AS slug, SUM((i->>'qty')::int)::int AS qty
      FROM orders o, jsonb_array_elements(o.items) i
      WHERE o.status = ANY(${[...HOLDING_STATUSES]})
      GROUP BY o.id, o.name, o.status, o.created_at, i->>'slug'
      ORDER BY o.created_at`,
  ]);

  const counts = Object.fromEntries(filters.map((f) => [f.key, products.filter((p) => matches(p, f.key)).length]));
  const list = products.filter((p) => matches(p, filter));
  const categoryLabel = (key: string) => categories.find((c) => c.key === key)?.label ?? key;
  const back = `/admin?tab=products${filter !== "all" ? `&stock=${filter}` : ""}`;
  const savedName = products.find((p) => p.slug === saved)?.name;
  const onHome = new Set(homeFeatured(products.filter((p) => !p.archived)).map((p) => p.slug));

  return (
    <div className="mt-8 space-y-6">
      {savedName && (
        <p className="rounded-lg border border-ok/40 bg-ok/10 p-4 text-sm text-ok" role="status">
          Saved {savedName}. The shop is updated.
        </p>
      )}
      {deleted && (
        <p className="rounded-lg border border-ok/40 bg-ok/10 p-4 text-sm text-ok" role="status">
          Deleted {deleted}.
        </p>
      )}
      {error === "product" && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger" role="alert">
          Couldn&apos;t save: enter a price between $0 and $100,000 and a whole-number quantity.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter products" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/admin?tab=products${f.key !== "all" ? `&stock=${f.key}` : ""}`}
              aria-current={filter === f.key ? "page" : undefined}
              className="chip !min-h-10 aria-[current=page]:border-signal aria-[current=page]:bg-signal/12 aria-[current=page]:text-white"
            >
              {f.label}
              <span className="font-mono text-xs text-fog">{counts[f.key]}</span>
            </Link>
          ))}
        </nav>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          <Plus size={16} weight="bold" aria-hidden /> Add product
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="card p-6 text-fog">{filter === "archived" ? "No archived products." : "No products in this view."}</p>
      ) : (
        <ul className="space-y-4">
          {list.map((p) => {
            const productHolds = holds.filter((h) => h.slug === p.slug);
            const edit = `/admin/products/${encodeURIComponent(p.slug)}`;
            return (
              <li key={p.slug} className="card p-4 sm:p-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="flex gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-panel-2 sm:size-24">
                      <Image src={p.image.src} alt={p.image.alt} fill sizes="96px" className="object-cover" />
                      {p.images.length > 1 && (
                        <span className="badge absolute right-1 bottom-1 bg-ink/80 text-mist" aria-label={`${p.images.length} photos`}>
                          {p.images.length}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link href={edit} className="text-lg hover:text-signal-hot">
                          {p.name}
                        </Link>
                        {!p.archived && (
                          <Link href={`/shop/${p.slug}`} target="_blank" className="text-fog hover:text-signal-hot" aria-label={`View ${p.name} in the shop (opens in a new tab)`}>
                            <ArrowSquareOut size={16} aria-hidden />
                          </Link>
                        )}
                      </p>
                      <p className="text-sm text-fog">
                        {p.condition} · {categoryLabel(p.category)}
                        {p.featured && (onHome.has(p.slug) ? " · On home page" : p.archived ? " · Featured" : " · Featured, not on home page (only the 4 newest show)")}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {p.archived ? (
                          <span className="badge bg-white/8 text-mist">Archived</span>
                        ) : (
                          <span className={`badge ${statusBadge[p.status]}`}>
                            {p.status === "available" ? `Available · ${p.stock}` : p.status === "reserved" ? "Reserved" : "Out of stock"}
                          </span>
                        )}
                        <span className="text-fog">
                          {p.quantity} on hand · {p.held} reserved · {money(p.price)}
                        </span>
                      </p>
                      {p.inStock && p.quantity < p.held && <p className="mt-1 text-sm text-danger">Fewer units on hand than are reserved. Check the count.</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:justify-end">
                    <form action={updateProductStock} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="slug" value={p.slug} />
                      <input type="hidden" name="back" value={back} />
                      <label className="block">
                        <span className="field-label !mb-1 text-xs">Price ($)</span>
                        <input name="price" type="number" inputMode="decimal" min="0" max="100000" step="0.01" required defaultValue={p.price} className="input !min-h-10 w-28 !py-2" />
                      </label>
                      <label className="block">
                        <span className="field-label !mb-1 text-xs">On hand</span>
                        <input name="quantity" type="number" inputMode="numeric" min="0" max="9999" step="1" required defaultValue={p.quantity} className="input !min-h-10 w-24 !py-2" />
                      </label>
                      <button className="btn btn-primary btn-sm">Save</button>
                    </form>

                    <form action={setProductInStock} className="flex" role="group" aria-label={`Stock status for ${p.name}`}>
                      <input type="hidden" name="slug" value={p.slug} />
                      <input type="hidden" name="back" value={back} />
                      <button
                        name="in_stock"
                        value="true"
                        aria-pressed={p.inStock}
                        className="chip !min-h-10 rounded-r-none !py-1.5 text-sm aria-pressed:border-ok aria-pressed:bg-ok/12 aria-pressed:text-ok"
                      >
                        In stock
                      </button>
                      <button
                        name="in_stock"
                        value="false"
                        aria-pressed={!p.inStock}
                        className="chip -ml-px !min-h-10 rounded-l-none !py-1.5 text-sm aria-pressed:border-danger aria-pressed:bg-danger/12 aria-pressed:text-danger"
                      >
                        Out of stock
                      </button>
                    </form>

                    <Link href={edit} className="btn btn-ghost btn-sm">
                      <PencilSimple size={16} aria-hidden /> Edit
                    </Link>
                  </div>
                </div>

                {productHolds.length > 0 && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="font-mono text-xs tracking-[0.14em] text-fog uppercase">Reserved for</p>
                    <ul className="mt-2 space-y-2">
                      {productHolds.map((h) => (
                        <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                          <span>
                            <Link href="/admin?tab=orders&view=all" className="font-mono text-signal-hot hover:underline">
                              {h.id}
                            </Link>{" "}
                            · {h.name} · qty {h.qty} · <span className="capitalize">{h.status}</span> <span className="text-fog">· {fmt(h.created_at)}</span>
                          </span>
                          <ConfirmRelease action={releaseOrder} id={h.id} back={back} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
