import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqList } from "@/components/sections/FaqList";
import { PageHero } from "@/components/sections/PageHero";
import { faqGroups } from "@/content/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about repair times, pricing, appointments, buying devices and tracking your repair at CTRL ALT DEL in Philadelphia.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero crumb="FAQ" title="Frequently asked questions" intro="Can't find what you're looking for? Give us a call and we'll help." />
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="FAQ topics" className="hidden lg:block">
            <ul className="sticky top-28 space-y-1 border-l border-line">
              {faqGroups.map((g) => (
                <li key={g.title}>
                  <a href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="-ml-px block border-l border-transparent py-2 pl-4 text-fog transition-colors hover:border-signal hover:text-white">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16">
            {faqGroups.map((g) => {
              const id = g.title.toLowerCase().replace(/[^a-z]+/g, "-");
              return (
                <section key={g.title} id={id} aria-labelledby={`${id}-title`}>
                  <h2 id={`${id}-title`} data-reveal className="display mb-4 text-3xl sm:text-4xl">
                    {g.title}
                  </h2>
                  <FaqList items={g.items} group={id} />
                </section>
              );
            })}
          </div>
        </div>
      </section>
      <CtaBand title="Still have a question?" body="Call us during business hours or stop by the shop. We're happy to help." />
    </>
  );
}
