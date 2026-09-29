import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { categories, type Category } from "@/content/products";
import { getShopProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Laptops, Phones & Electronics",
  description: "Refurbished and pre-owned laptops, phones, tablets and game consoles, plus chargers, cables and accessories. Reserve online and pick up in Kensington, Philadelphia.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { cat } = await searchParams;
  const initial = categories.some((c) => c.key === cat) ? (cat as Category | "all") : "all";

  return (
    <>
      <PageHero
        crumb="Shop"
        title="The shop"
        intro="Tested phones, laptops, consoles and accessories. Reserve online, then pay and pick up at the shop."
      />
      <section className="container-x py-12 sm:py-16">
        <ShopBrowser products={await getShopProducts()} initialCategory={initial} />
      </section>
    </>
  );
}
