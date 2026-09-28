import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brandLogos } from "@/content/brand-logos";
import { coreServices } from "@/content/services";

export function ServicesGrid() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="services-title">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHeading
          index="01"
          eyebrow="What we do"
          title={<span id="services-title">Repairs, sales & straight answers</span>}
          intro="Whether you're looking to fix a broken or cracked screen, find accessories, or buy something new, we're sure to be able to help."
        />
        <Link data-reveal href="/services" className="link-arrow shrink-0">
          All services <ArrowUpRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {coreServices.map((s, i) => (
          <article
            key={s.id}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
            className="group card relative flex flex-col overflow-hidden transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-signal/60"
          >
            <div className="relative aspect-[16/11] overflow-hidden">
              <Image
                src={s.image.src}
                alt={s.image.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" />
              <span className="absolute top-4 left-4 font-mono text-xs tracking-[0.2em] text-white/80">[{s.code}]</span>
            </div>
            <div className="relative flex flex-1 flex-col p-6 pt-2">
              <span className="absolute -top-px left-6 h-px w-0 bg-signal transition-[width] duration-700 ease-out-expo group-hover:w-[calc(100%-3rem)]" aria-hidden />
              <h3 className="display text-3xl">
                <Link href={s.href} className="after:absolute after:inset-0 after:content-['']">
                  {s.title}
                </Link>
              </h3>
              <p className="mt-3 text-fog">{s.summary}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-mist">
                    <Check size={14} weight="bold" className="text-signal" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
              <span className="link-arrow mt-6 text-sm" aria-hidden>
                Learn more <ArrowUpRight size={14} weight="bold" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div data-reveal className="mt-14 border-y border-line py-8">
        <p className="text-center font-mono text-xs tracking-[0.18em] text-fog uppercase">We fix all major brands</p>
        <ul className="mt-7 grid grid-cols-3 items-center justify-items-center gap-x-6 gap-y-8 sm:grid-cols-5 lg:grid-cols-7" aria-label="Brands we repair">
          {brandLogos.map((b) => {
            const height = Math.min(34, Math.max(17, 30 / Math.sqrt(b.aspect)));
            return (
              <li key={b.name} className="flex h-9 items-center">
                <svg
                  viewBox={b.viewBox}
                  role="img"
                  aria-label={b.name}
                  fill="currentColor"
                  style={{ height, width: height * b.aspect }}
                  className="text-fog transition-colors duration-300 hover:text-white"
                >
                  <path d={b.d} />
                </svg>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
