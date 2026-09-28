import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reviews } from "@/components/sections/Reviews";
import { TraceDivider } from "@/components/ui/TraceDivider";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <Hero layout="banner" />
      <TraceDivider />
      <ServicesGrid />
      <ProcessSteps />
      <PricingTeaser />
      <TraceDivider />
      <ShopTeaser />
      <Reviews />
      <CtaBand visit />
    </>
  );
}
