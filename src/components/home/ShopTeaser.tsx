import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading, type HeadingTier } from "@/components/ui/SectionHeading";
import { getShopProducts } from "@/lib/catalog";

export async function ShopTeaser({ code = "C4", tier = "primary" }: { code?: string; tier?: HeadingTier } = {}) {
  const featured = (await getShopProducts()).filter((p) => p.featured).slice(0, 4);
  return (
    <section className="border-t border-line bg-ink-2 py-16 sm:py-28" aria-labelledby="shop-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            code={code}
            tier={tier}
            eyebrow="Shop"
            title={<span id="shop-title">Tested tech, ready to go</span>}
            intro="Laptops, phones, consoles and accessories. Every refurbished and pre-owned device is inspected in our shop before it hits the shelf."
          />
          <Link data-reveal href="/shop" className="link-arrow shrink-0">
            Shop all products <ArrowUpRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
