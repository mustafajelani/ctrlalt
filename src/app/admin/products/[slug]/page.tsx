import { Archive, ArrowLeft, ArrowSquareOut, ArrowUUpLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setProductArchived, deleteProduct } from "@/app/admin/product-actions";
import { ConfirmAction } from "@/components/admin/ConfirmDelete";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdmin } from "@/lib/auth";
import { loadAllProducts } from "@/lib/catalog";
import { uploadsAvailable } from "@/lib/images";

export const metadata: Metadata = { title: "Edit product", robots: { index: false, follow: false } };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const product = (await loadAllProducts()).find((p) => p.slug === slug);
  if (!product) notFound();
  const back = `/admin/products/${encodeURIComponent(slug)}`;

  return (
    <section className="container-x py-10 sm:py-14">
      <Link href="/admin?tab=products" className="inline-flex min-h-10 items-center gap-2 text-sm text-fog hover:text-white">
        <ArrowLeft size={16} aria-hidden /> Back to products
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-fog">
            <span className="font-mono">/shop/{product.slug}</span>
            {product.archived ? (
              <span className="badge bg-white/8 text-mist">Archived: hidden from the shop</span>
            ) : (
              <Link href={`/shop/${product.slug}`} target="_blank" className="inline-flex items-center gap-1 text-signal-hot hover:underline">
                View in shop <ArrowSquareOut size={14} aria-hidden />
              </Link>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={setProductArchived}>
            <input type="hidden" name="slug" value={product.slug} />
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="archived" value={product.archived ? "false" : "true"} />
            <button className="btn btn-ghost btn-sm">
              {product.archived ? <ArrowUUpLeft size={16} aria-hidden /> : <Archive size={16} aria-hidden />}
              {product.archived ? "Restore to shop" : "Archive"}
            </button>
          </form>
          <ConfirmAction
            action={deleteProduct}
            fields={{ slug: product.slug }}
            trigger="Delete"
            triggerIcon="trash"
            triggerLabel={`Delete ${product.name}`}
            title={<>Delete {product.name}?</>}
            body="This permanently removes the listing and its photos. Past orders keep their details. To just hide it from the shop, use Archive instead. This can't be undone."
            confirmLabel="Delete permanently"
            pendingLabel="Deleting…"
            danger
          />
        </div>
      </div>

      {error === "held" && (
        <p className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger" role="alert">
          Can&apos;t delete: an active order still holds this product. Release or complete that order first, or archive the product instead.
        </p>
      )}

      <div className="mt-8">
        <ProductEditor
          mode="edit"
          uploadsEnabled={uploadsAvailable()}
          initial={{
            slug: product.slug,
            name: product.name,
            category: product.category,
            condition: product.condition,
            summary: product.summary,
            specs: product.specs,
            images: product.images,
            price: product.price,
            quantity: product.quantity,
            inStock: product.inStock,
            featured: !!product.featured,
          }}
        />
      </div>
    </section>
  );
}
