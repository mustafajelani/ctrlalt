import { ArrowRight, CalendarCheck, NavigationArrow, Phone } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/sections/PageHero";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description: `Call ${site.phone.display} or visit CTRL ALT DEL at 319 E Allegheny Ave, Philadelphia, PA 19134. Open Monday to Saturday.`,
  alternates: { canonical: "/contact" },
};

const quick = [
  { icon: Phone, title: "Call us", body: site.phone.display, href: site.phone.href, external: false },
  { icon: NavigationArrow, title: "Visit the shop", body: `${site.address.street}, ${site.address.city}`, href: site.mapsUrl, external: true },
  { icon: CalendarCheck, title: "Book online", body: "Reserve a drop-off time", href: "/book", external: false },
];

export default function ContactPage() {
  return (
    <>
      <PageHero crumb="Contact" title="Get in touch" intro="Call, stop by, or send a message. The fastest way to reach us during business hours is by phone." />

      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <ul className="space-y-4">
            {quick.map((q, i) => {
              const inner = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line-2 text-signal transition-colors group-hover:border-signal">
                    <q.icon size={24} aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">{q.title}</span>
                    <span className="text-fog">{q.body}</span>
                  </span>
                  <ArrowRight size={18} className="text-fog transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal-hot" aria-hidden />
                </>
              );
              const cls = "group card flex items-center gap-5 p-5 transition-colors hover:border-signal/60";
              return (
                <li key={q.title} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  {q.external ? (
                    <a href={q.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {inner}
                    </a>
                  ) : q.href.startsWith("/") ? (
                    <Link href={q.href} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <a href={q.href} className={cls}>
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <ContactForm />
        </div>
      </section>

      <div className="border-t border-line">
        <ServiceArea code="U1" />
      </div>
    </>
  );
}
