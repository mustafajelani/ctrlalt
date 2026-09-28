import { ArrowRight, Check, Cpu, HardDrives, Lightbulb, ShieldCheck, Storefront, Wrench } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/content/images";
import { deviceServices } from "@/content/services";

export const metadata: Metadata = {
  title: "Repair Services",
  description:
    "Phone, laptop, tablet, game console and desktop repair in Kensington, Philadelphia. Screen replacements, batteries, charging ports, broken keys, upgrades and data recovery.",
  alternates: { canonical: "/services" },
};

const pillars = [
  {
    id: "repair",
    icon: Wrench,
    title: "Hardware Repair",
    body: "Screen replacements, broken keys, or repairing any other piece of hardware. From a single cracked panel to a device that won't power on, we diagnose it and fix it right.",
  },
  {
    id: "sales",
    icon: Storefront,
    title: "Sales",
    body: "Laptops, phones, and other electronics are available for purchase. New accessories plus refurbished and pre-owned devices tested in our shop.",
    link: { href: "/shop", label: "Visit the shop" },
  },
  {
    id: "advice",
    icon: Lightbulb,
    title: "Advice & Other Services",
    body: "If you need help upgrading your device or need an answer to a tech problem, we can help you get what you need, whether that's an SSD upgrade or an honest opinion on what to buy.",
  },
];

const extras = [
  { icon: Cpu, title: "Upgrades", body: "SSD and RAM upgrades that make older laptops and desktops feel new again." },
  { icon: ShieldCheck, title: "Virus removal", body: "Malware cleanup, tune-ups and fresh OS installs for slow machines." },
  { icon: HardDrives, title: "Data transfer & recovery", body: "Move everything to your new device, or recover files from a failing drive." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumb="Services"
        title="Repair services"
        intro="Phones, laptops, tablets, consoles and desktops. Tell us what's wrong and we'll get it fixed, with an upfront quote before any work begins."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/book" className="btn btn-primary">
            Book a repair <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
          <Link href="/pricing" className="btn btn-ghost">
            View pricing
          </Link>
        </div>
      </PageHero>

      <section className="container-x py-20 sm:py-24">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <article id={p.id} key={p.id} data-reveal style={{ "--i": i } as React.CSSProperties} className="card p-7">
              <p.icon size={34} className="text-signal" aria-hidden />
              <h2 className="display mt-6 text-3xl">{p.title}</h2>
              <p className="mt-3 text-fog">{p.body}</p>
              {p.link && (
                <Link href={p.link.href} className="link-arrow mt-5 text-sm">
                  {p.link.label} <ArrowRight size={14} weight="bold" aria-hidden />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="container-x pb-20 sm:pb-28" aria-labelledby="devices-title">
        <SectionHeading index="01" eyebrow="By device" title={<span id="devices-title">What we fix</span>} />
        <div className="mt-14 space-y-6">
          {deviceServices.map((d, i) => (
            <article
              id={d.device}
              key={d.device}
              data-reveal
              className="card grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]"
            >
              <div className={`relative aspect-[16/10] md:aspect-auto md:min-h-80 ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={d.image.src} alt={d.image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col p-7 sm:p-10">
                <span className="font-mono text-xs tracking-[0.2em] text-signal-hot">0{i + 1}</span>
                <h3 className="display mt-3 text-4xl sm:text-5xl">{d.title}</h3>
                <p className="mt-3 text-fog">{d.blurb}</p>
                <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {d.repairs.map((r) => (
                    <li key={r} className="flex items-center gap-2.5 text-mist">
                      <Check size={14} weight="bold" className="shrink-0 text-signal" aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/book?device=${d.device}`} className="btn btn-primary btn-sm">
                    Book {d.title.toLowerCase()} repair
                  </Link>
                  <Link href={`/pricing#${d.device}`} className="btn btn-ghost btn-sm">
                    Prices
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProcessSteps />

      <section className="container-x py-16 sm:py-28" aria-labelledby="extras-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal="scale" className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line">
            <Image src={images.soldering.src} alt={images.soldering.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading index="03" eyebrow="Beyond repairs" title={<span id="extras-title">Upgrades, cleanups & data</span>} />
            <ul className="mt-10 space-y-6">
              {extras.map((e, i) => (
                <li key={e.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line-2 text-signal">
                    <e.icon size={24} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{e.title}</h3>
                    <p className="mt-1 text-fog">{e.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
