import { ArrowRight, ArrowUpRight, Clock, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { images } from "@/content/images";
import { site } from "@/lib/site";

export function CtaBand({
  title = (
    <>
      Press <span className="text-signal-hot">Ctrl+Alt+Del</span> on your tech troubles.
    </>
  ),
  body = "Book online in under a minute or just walk in. We'll diagnose it, quote it upfront, and get you back up and running.",
  visit = false,
}: {
  title?: React.ReactNode;
  body?: string;
  /** Adds a compact address / hours / directions row, standing in for a full service-area section. */
  visit?: boolean;
}) {
  return (
    <section className="container-x py-16 sm:py-28">
      <div data-reveal="scale" className="relative isolate overflow-hidden rounded-3xl border border-line">
        <Image src={images.motherboard.src} alt="" fill sizes="(min-width: 1216px) 1152px, 100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        <div className="absolute inset-y-0 left-0 -z-10 w-1 bg-signal" />
        <div className="max-w-2xl px-6 py-14 sm:px-12 sm:py-20">
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-5 text-lg text-mist">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-primary">
              Book a repair <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
            <a href={site.phone.href} className="btn btn-ghost">
              <Phone size={18} aria-hidden /> {site.phone.display}
            </a>
          </div>

          {visit && (
            <div className="mt-10 grid gap-5 border-t border-line pt-7 text-sm sm:grid-cols-2">
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-mist hover:text-signal-hot">
                <MapPin size={20} className="mt-0.5 shrink-0 text-signal" aria-hidden />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.city}, {site.address.region} {site.address.postal}
                </span>
              </a>
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-signal" aria-hidden />
                <div>
                  <OpenStatus className="text-mist" />
                  <p className="mt-1 text-fog">Mon–Fri 10–5 · Sat 12–5 · Sun closed</p>
                  <Link href="/contact" className="link-arrow mt-2 text-sm">
                    Map & directions <ArrowUpRight size={14} weight="bold" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
