import { ArrowRight, Phone } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { StarRating } from "@/components/sections/Reviews";
import { site } from "@/lib/site";
import { HeroBoard } from "./HeroBoard";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;
const terminal = "system restored · device ready";

/**
 * split  (default): headline + pitch left, circuit board right.
 * banner: headline spans the full width on desktop (up to 9rem) for a stronger primary level; pitch/stats left, board right below it.
 * Phones get the same stacked order in both: headline -> pitch -> board -> stats.
 */
export function Hero({ layout = "split" }: { layout?: "split" | "banner" }) {
  const banner = layout === "banner";

  const headline = (
    <>
      <p className="eyebrow hero-fade" style={d(0)}>
        {site.address.neighborhood} · Philadelphia
      </p>
      {/* "TECH EXPERTS" is ~7.2em wide in Chakra Petch Bold; sizes keep it on one line per column width. */}
      <h1
        className={`display mt-5 text-[clamp(2.25rem,calc(13.5vw_-_0.25rem),5rem)] sm:mt-6 ${
          banner ? "lg:text-[clamp(4rem,calc(13.5vw_-_0.75rem),9rem)]" : "lg:text-[clamp(3rem,calc(6.75vw_-_0.5rem),4.75rem)]"
        }`}
      >
        <span className="hero-line">
          <span style={d(0.08)}>Your local</span>
        </span>
        <span className="hero-line">
          <span style={d(0.18)} className="text-signal">
            tech experts
          </span>
        </span>
      </h1>
    </>
  );

  const pitch = (
    <>
      <p className={`hero-fade mt-5 max-w-xl text-lg leading-relaxed text-mist sm:mt-7 sm:text-xl ${banner ? "lg:mt-0" : ""}`} style={d(0.35)}>
        Fast, reliable repairs for phones, laptops, tablets and consoles.
        <span className="hidden sm:inline"> Cracked screens, dead batteries and broken keys, fixed right here on East Allegheny Avenue.</span>
      </p>
      <div className="hero-fade mt-7 flex gap-3 sm:mt-9" style={d(0.48)}>
        <Link href="/book" className="btn btn-primary h-13 flex-[1.4] px-5 text-base sm:flex-none sm:px-7">
          Book a repair <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
        <a href={site.phone.href} aria-label={`Call ${site.phone.display}`} className="btn btn-ghost h-13 flex-1 px-5 text-base sm:flex-none sm:px-6">
          <Phone size={18} aria-hidden />
          <span className="sm:hidden">Call</span>
          <span className="hidden sm:inline">{site.phone.display}</span>
        </a>
      </div>
    </>
  );

  return (
    <section className="relative overflow-hidden">
      <div className="pcb-grid pcb-fade absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute top-1/3 -right-40 size-[40rem] rounded-full bg-signal/10 blur-[120px]" aria-hidden />

      <div className="container-x relative grid gap-10 pt-8 pb-16 sm:pt-16 sm:pb-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-12 lg:pt-20 lg:pb-28">
        {banner ? (
          <>
            <div className="lg:col-span-2 lg:row-start-1">{headline}</div>
            {/* Cancels the grid gap on phones so the pitch sits as close to the headline as in split mode. */}
            <div className="-mt-10 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-start">{pitch}</div>
          </>
        ) : (
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            {headline}
            {pitch}
          </div>
        )}

        <div
          className={`hero-fade lg:col-start-2 lg:row-span-2 ${banner ? "lg:row-start-2 lg:self-start" : "lg:row-start-1 lg:self-center"}`}
          style={d(0.25)}
        >
          <HeroBoard />
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-y-4" aria-hidden>
            <div className="flex items-center gap-2.5 font-mono text-fog">
              <kbd className="keycap" style={d(0.55)}>
                Ctrl
              </kbd>
              +
              <kbd className="keycap" style={d(0.75)}>
                Alt
              </kbd>
              +
              <kbd className="keycap" style={d(0.95)}>
                Del
              </kbd>
            </div>
            <p className="font-mono text-sm text-mist">
              <span className="text-signal">&gt; </span>
              <span className="typing" style={{ ...d(2.5), "--chars": terminal.length } as React.CSSProperties}>
                {terminal}
              </span>
              <span className="caret" />
            </p>
          </div>
        </div>

        <dl
          className={`hero-fade grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-7 lg:col-start-1 lg:self-start ${banner ? "lg:row-start-3" : "lg:row-start-2"}`}
          style={d(0.6)}
        >
          <div>
            <dt className="sr-only">Google rating</dt>
            <dd>
              <span className="display text-2xl sm:text-3xl">{site.rating.value}</span>
              <StarRating value={site.rating.value} size={14} />
              <span className="mt-1 block text-xs text-fog">Google rating</span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Open</dt>
            <dd>
              <span className="display text-2xl sm:text-3xl">6 days</span>
              <span className="mt-1 block text-xs text-fog">a week, walk-ins welcome</span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Devices</dt>
            <dd>
              <span className="display text-2xl sm:text-3xl">All brands</span>
              <span className="mt-1 block text-xs text-fog">Apple, Samsung, Dell, Sony & more</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
