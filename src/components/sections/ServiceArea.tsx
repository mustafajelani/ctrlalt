import { Clock, MapPin, NavigationArrow, Phone } from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { hoursLabel } from "@/lib/hours";
import { serviceAreas, site } from "@/lib/site";
import { MapEmbed } from "./MapEmbed";

export function ServiceArea({ index = "05" }: { index?: string }) {
  return (
    <section className="container-x py-16 sm:py-28" aria-labelledby="area-title">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHeading
            index={index}
            eyebrow="Service area"
            title={<span id="area-title">Your neighborhood tech shop</span>}
            intro={`Find us on East Allegheny Avenue in ${site.address.neighborhood}. Customers bring us their devices from across North and Northeast Philly, and from all over the city.`}
          />
          <ul data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-8 flex flex-wrap gap-2" aria-label="Neighborhoods we serve">
            {serviceAreas.map((a) => (
              <li key={a} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm text-mist">
                {a}
              </li>
            ))}
          </ul>

          <div data-reveal style={{ "--i": 4 } as React.CSSProperties} className="card mt-8 divide-y divide-line">
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 transition-colors hover:bg-panel-2">
              <MapPin size={22} className="mt-0.5 shrink-0 text-signal" aria-hidden />
              <span>
                <span className="block font-semibold">{site.address.street}</span>
                <span className="text-sm text-fog">
                  {site.address.city}, {site.address.region} {site.address.postal}
                </span>
              </span>
              <NavigationArrow size={18} className="ml-auto shrink-0 text-fog" aria-hidden />
            </a>
            <a href={site.phone.href} className="flex items-center gap-4 p-5 transition-colors hover:bg-panel-2">
              <Phone size={22} className="shrink-0 text-signal" aria-hidden />
              <span className="font-semibold">{site.phone.display}</span>
            </a>
            <div className="flex items-start gap-4 p-5">
              <Clock size={22} className="mt-0.5 shrink-0 text-signal" aria-hidden />
              <div className="flex-1 text-sm">
                <OpenStatus className="mb-3 font-mono text-xs text-mist" />
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
                  {site.hours.map((h) => (
                    <div key={h.day} className="contents">
                      <dt className="text-fog">{h.name}</dt>
                      <dd className="text-right tabular-nums">{hoursLabel(h)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div data-reveal="scale" className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-panel lg:sticky lg:top-28 lg:aspect-[4/5]">
          <MapEmbed />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-signal/20 ring-inset" aria-hidden />
        </div>
      </div>
    </section>
  );
}
