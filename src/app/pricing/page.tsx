import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { PricingTabs } from "@/components/pricing/PricingTabs";

export const metadata: Metadata = {
  title: "Repair Pricing",
  description: "Upfront starting prices for phone, laptop, tablet, console and desktop repairs at CTRL ALT DEL in Kensington, Philadelphia.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        crumb="Pricing"
        title="Upfront pricing"
        intro="Starting prices for our most common repairs. Exact pricing depends on your make and model. You'll always get a quote to approve before we start."
      />
      <section className="container-x py-16 sm:py-24">
        <PricingTabs />
        <p className="mt-8 max-w-3xl text-sm text-fog">
          Prices shown are starting prices and may vary by model, part availability and part quality. &ldquo;+ parts&rdquo; means the part is priced separately and
          quoted before work begins. Don&apos;t see your repair? Call us or book a diagnosis.
        </p>
      </section>
      <CtaBand title="Not sure what's wrong?" body="Book a diagnosis and we'll find the fault and give you a clear quote before any work begins." />
    </>
  );
}
