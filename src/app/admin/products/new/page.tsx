import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdmin } from "@/lib/auth";
import { uploadsAvailable } from "@/lib/images";

export const metadata: Metadata = { title: "New product", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <section className="container-x py-10 sm:py-14">
      <Link href="/admin?tab=products" className="inline-flex min-h-10 items-center gap-2 text-sm text-fog hover:text-white">
        <ArrowLeft size={16} aria-hidden /> Back to products
      </Link>
      <h1 className="display mt-4 text-4xl sm:text-5xl">New product</h1>
      <div className="mt-8">
        <ProductEditor
          mode="create"
          uploadsEnabled={uploadsAvailable()}
          initial={{ name: "", category: "phones", condition: "Refurbished", summary: "", specs: [], images: [], price: 0, quantity: 1, inStock: true, featured: false }}
        />
      </div>
    </section>
  );
}
