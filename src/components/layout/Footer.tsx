import { MapPin, NavigationArrow, Phone } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LogoMark } from "@/components/brand/LogoMark";
import { hoursLabel } from "@/lib/hours";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Repairs",
    links: [
      { href: "/services#phone", label: "Phone repair" },
      { href: "/services#laptop", label: "Laptop repair" },
      { href: "/services#tablet", label: "Tablet repair" },
      { href: "/services#console", label: "Console repair" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/shop?cat=phones", label: "Phones" },
      { href: "/shop?cat=laptops", label: "Laptops" },
      { href: "/shop?cat=gaming", label: "Gaming" },
      { href: "/shop?cat=accessories", label: "Accessories" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/book", label: "Book a repair" },
      { href: "/track", label: "Track your repair" },
      { href: "/faq", label: "FAQ" },
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-2 pb-24 lg:pb-0">
      <LogoMark className="pointer-events-none absolute -right-24 -bottom-28 hidden w-[34rem] text-white/[0.025] lg:block" strokeWidth={9} />

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
        <div className="space-y-6">
          <Logo className="h-8 w-auto" />
          <p className="max-w-sm text-fog">
            Fast, reliable repairs for all devices, plus laptops, phones and electronics for sale. Proudly serving {site.address.neighborhood} and all of Philadelphia.
          </p>
          <div className="space-y-3 text-sm">
            <a href={site.phone.href} className="flex items-center gap-3 text-mist hover:text-signal-hot">
              <Phone size={18} className="text-signal" aria-hidden /> {site.phone.display}
            </a>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-mist hover:text-signal-hot">
              <MapPin size={18} className="mt-0.5 shrink-0 text-signal" aria-hidden />
              <span>
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postal}
              </span>
            </a>
          </div>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <NavigationArrow size={16} aria-hidden /> Get directions
          </a>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-mono text-xs tracking-[0.18em] text-fog uppercase">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-mist transition-colors hover:text-signal-hot">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-fog uppercase">Hours</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {site.hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-3">
                  <dt className="text-fog">{h.name.slice(0, 3)}</dt>
                  <dd className={h.open ? "text-mist" : "text-fog"}>{hoursLabel(h)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved. Brand names and logos belong to their respective owners.
          </p>
          <p className="font-mono">
            <span className="text-signal">&gt;</span> {site.address.city}, {site.address.region}
          </p>
        </div>
      </div>
    </footer>
  );
}
