import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqList } from "@/components/sections/FaqList";
import { Reviews } from "@/components/sections/Reviews";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqGroups } from "@/content/faqs";

export default function HomePage() {
  const topFaqs = [faqGroups[0].items[0], faqGroups[0].items[1], faqGroups[1].items[0], faqGroups[3].items[0]];

  return (
    <>
      <Hero />
      <ServicesGrid />
      <ProcessSteps />
      <PricingTeaser />
      <ShopTeaser />
      <Reviews index="05" />
      <ServiceArea index="06" />

      <section className="border-t border-line bg-ink-2 py-20 sm:py-28" aria-labelledby="faq-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading index="07" eyebrow="FAQ" title={<span id="faq-title">Good questions</span>} intro="Quick answers to what people ask us most." />
            <Link data-reveal href="/faq" className="link-arrow mt-8">
              All FAQs <ArrowUpRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <FaqList items={topFaqs} group="home" />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
