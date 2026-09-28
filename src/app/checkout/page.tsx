import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Reserve your items for in-store pickup at CTRL ALT DEL.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero crumb="Checkout" title="Checkout" intro="Reserve your items now and pay when you pick them up at the shop. No card needed online." />
      <section className="container-x py-12 sm:py-16">
        <CheckoutForm />
      </section>
    </>
  );
}
