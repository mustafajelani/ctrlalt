import { ArrowLeft, Check, MapPin, ShieldCheck, Storefront } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, conditionStyle, productStatus } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { cartSnapshot, money, PLACEHOLDER_IMAGE } from "@/content/products";
import { getShopProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getShopProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getShopProducts()).find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.name} (${product.condition})`,
    description: `${product.summary} ${money(product.price)} at CTRL ALT DEL, ${site.address.street}, Philadelphia.`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { images: [{ url: product.image.src }] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const live = await getShopProducts();
  const product = live.find((p) => p.slug === slug);
  if (!product) notFound();
  const status = productStatus(product);

  const related = live.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const conditionSchema = {
    New: "https://schema.org/NewCondition",
    Refurbished: "https://schema.org/RefurbishedCondition",
    "Pre-owned": "https://schema.org/UsedCondition",
  }[product.condition];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: product.image.src,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      itemCondition: conditionSchema,
      availability: status === "available" ? "https://schema.org/InStoreOnly" : "https://schema.org/OutOfStock",
      url: `${site.url}/shop/${product.slug}`,
      seller: { "@id": `${site.url}/#business` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="container-x py-10 sm:py-14">
        <Link href="/shop" className="inline-flex min-h-10 items-center gap-2 text-sm text-fog hover:text-white">
          <ArrowLeft size={16} aria-hidden /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            images={product.images.length ? product.images : [PLACEHOLDER_IMAGE]}
            name={product.name}
            badge={<span className={`badge absolute top-4 left-4 backdrop-blur ${conditionStyle[product.condition]}`}>{product.condition}</span>}
          />

          <div className="hero-fade flex flex-col" style={{ "--d": "0.12s" } as React.CSSProperties}>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl">{product.name}</h1>
            <p className="mt-4 font-mono text-3xl tabular-nums">{money(product.price)}</p>
            <p className="mt-5 text-lg text-mist">{product.summary}</p>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.specs.map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-mist">
                  <Check size={14} weight="bold" className="shrink-0 text-signal" aria-hidden /> {s}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-line pt-8">
              <ProductPurchase product={cartSnapshot(product)} stock={product.stock} status={status} />
              <p className={`mt-3 text-sm ${status === "available" ? "text-ok" : "text-fog"}`}>
                {status === "available"
                  ? product.stock <= 2
                    ? `Only ${product.stock} left in store`
                    : "In stock at the shop"
                  : status === "reserved"
                    ? "Currently reserved by another customer. Check back soon or call us."
                    : "Currently out of stock"}
              </p>
            </div>

            <ul className="card mt-8 divide-y divide-line text-sm">
              <li className="flex gap-4 p-5">
                <Storefront size={22} className="shrink-0 text-signal" aria-hidden />
                <span>
                  <span className="block font-semibold">Reserve online, pay at pickup</span>
                  <span className="text-fog">We&apos;ll call to confirm and set it aside for you.</span>
                </span>
              </li>
              <li className="flex gap-4 p-5">
                <ShieldCheck size={22} className="shrink-0 text-signal" aria-hidden />
                <span>
                  <span className="block font-semibold">Inspected in our shop</span>
                  <span className="text-fog">Refurbished and pre-owned devices are tested before sale.</span>
                </span>
              </li>
              <li className="flex gap-4 p-5">
                <MapPin size={22} className="shrink-0 text-signal" aria-hidden />
                <span>
                  <span className="block font-semibold">Pick up in Kensington</span>
                  <span className="text-fog">
                    {site.address.street}, {site.address.city}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-ink-2 py-16 sm:py-20" aria-labelledby="related-title">
          <div className="container-x">
            <h2 id="related-title" className="display text-3xl sm:text-4xl">
              You might also like
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
