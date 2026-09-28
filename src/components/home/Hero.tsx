import { ArrowRight, Phone } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { StarRating } from "@/components/sections/Reviews";
import { site } from "@/lib/site";
import { HeroBoard } from "./HeroBoard";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;
const terminal = "system restored · device ready";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pcb-grid pcb-fade absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute top-1/3 -right-40 size-[40rem] rounded-full bg-signal/10 blur-[120px]" aria-hidden />

      <div className="container-x relative grid items-center gap-14 pt-12 pb-20 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pt-20 lg:pb-28">
        <div>
          <p className="eyebrow hero-fade" style={d(0)}>
            {site.address.neighborhood} · Philadelphia
          </p>

          <h1 className="display mt-6 text-[clamp(3.4rem,10vw,6.9rem)]">
            <span className="hero-line">
              <span style={d(0.08)}>Your local</span>
            </span>
            <span className="hero-line">
              <span style={d(0.18)} className="text-signal">
                tech experts
              </span>
            </span>
          </h1>

          <p className="hero-fade mt-7 max-w-xl text-lg leading-relaxed text-mist sm:text-xl" style={d(0.35)}>
            Fast, reliable repairs for phones, laptops, tablets and consoles. Cracked screens, dead batteries and broken keys,
            fixed right here on East Allegheny Avenue.
          </p>

          <div className="hero-fade mt-9 flex flex-wrap gap-3" style={d(0.48)}>
            <Link href="/book" className="btn btn-primary h-13 px-7 text-base">
              Book a repair <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <a href={site.phone.href} className="btn btn-ghost h-13 px-6 text-base">
              <Phone size={18} aria-hidden /> {site.phone.display}
            </a>
          </div>

          <dl className="hero-fade mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-7" style={d(0.6)}>
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

        <div className="hero-fade" style={d(0.25)}>
          <HeroBoard />
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:justify-between" aria-hidden>
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
      </div>
    </section>
  );
}
