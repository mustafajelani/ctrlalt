import { Handshake, Lightning, MapPin, Tag } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { Reviews } from "@/components/sections/Reviews";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/content/images";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: "CTRL ALT DEL is a neighborhood tech repair and electronics shop on East Allegheny Avenue in Kensington, Philadelphia.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Lightning, title: "Fast", body: "Many common repairs are done the same day, and we keep you posted along the way." },
  { icon: Tag, title: "Fair", body: "Upfront quotes and honest prices. You approve the cost before we start." },
  { icon: Handshake, title: "Straight answers", body: "If a repair isn't worth it, we'll tell you, and help you find what you actually need." },
  { icon: MapPin, title: "Local", body: `A neighborhood shop in ${site.address.neighborhood}, serving all of Philadelphia.` },
];

export default function AboutPage() {
  return (
    <>
      <PageHero crumb="About" title="About the shop" intro="Your local tech experts on East Allegheny Avenue. Fast and reliable repairs for all devices." />

      <section className="container-x py-16 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal="scale" className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image src={images.shopFloor.src} alt={images.shopFloor.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-6 pt-20">
              <p className="font-mono text-xs tracking-[0.18em] text-mist uppercase">
                <span className="text-signal">●</span> {site.address.street} · {site.address.city}
              </p>
            </div>
          </div>
          <div>
            <SectionHeading code="U1" eyebrow="Who we are" title="Fixing the neighborhood's tech" />
            <div data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-6 space-y-4 text-lg text-mist">
              <p>
                Whether you&apos;re looking to fix a broken or cracked screen, shop for accessories, or buy something new, we at CTRL ALT DEL are sure to be able to help.
              </p>
              <p>
                We repair phones, laptops, tablets and game consoles: screen replacements, broken keys, batteries, charging ports, and just about any other piece of
                hardware. We also sell laptops, phones and electronics, and we&apos;re happy to help you upgrade a device or answer a tech question.
              </p>
              <p>No jargon and no runaround. Just a clear quote, a careful repair, and your device back in your hands.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-16 sm:py-28">
        <div className="container-x">
          <SectionHeading code="J2" tier="secondary" eyebrow="How we work" title="What you can count on" align="center" />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="card p-7">
                <v.icon size={32} className="text-signal" aria-hidden />
                <h3 className="display mt-6 text-3xl">{v.title}</h3>
                <p className="mt-2 text-fog">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Reviews code="Q3" />
      <CtaBand />
    </>
  );
}
