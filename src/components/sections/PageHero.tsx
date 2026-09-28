import Link from "next/link";

const traces = [
  "M0 60 H140 L180 100 H320",
  "M0 120 H90 L130 160 H260 L300 200 H420",
  "M60 0 V40 L100 80 H220",
  "M200 240 V190 L240 150 H420",
];

export function PageHero({ crumb, title, intro, children }: { crumb: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pcb-grid pcb-fade absolute inset-0" aria-hidden />
      <svg viewBox="0 0 420 240" className="board pointer-events-none absolute -right-10 top-1/2 hidden w-[36rem] -translate-y-1/2 opacity-60 md:block" aria-hidden>
        {traces.map((d) => (
          <path key={`b-${d}`} d={d} className="trace" />
        ))}
        {traces.map((d, i) => (
          <path key={`l-${d}`} d={d} pathLength={1} className="trace-lit" style={{ "--d": `${0.3 + i * 0.15}s` } as React.CSSProperties} />
        ))}
        {traces.map((d, i) => (
          <path key={`p-${d}`} d={d} pathLength={1} className="pulse" style={{ "--d": `${1.6 + i * 0.7}s`, "--dur": "3.4s" } as React.CSSProperties} />
        ))}
      </svg>
      <div className="container-x relative py-16 sm:py-24">
        <nav aria-label="Breadcrumb" className="hero-fade font-mono text-xs tracking-[0.15em] text-fog uppercase" style={{ "--d": "0s" } as React.CSSProperties}>
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-signal">
              /
            </li>
            <li aria-current="page" className="text-mist">
              {crumb}
            </li>
          </ol>
        </nav>
        <h1 className="display mt-6 max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
          <span className="hero-line">
            <span style={{ "--d": "0.05s" } as React.CSSProperties}>{title}</span>
          </span>
        </h1>
        {intro && (
          <p className="hero-fade mt-6 max-w-2xl text-lg text-mist" style={{ "--d": "0.25s" } as React.CSSProperties}>
            {intro}
          </p>
        )}
        {children && (
          <div className="hero-fade mt-8" style={{ "--d": "0.35s" } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
