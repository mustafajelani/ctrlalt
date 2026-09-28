import { ArrowUpRight, Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import { reviewThemes, reviews } from "@/content/reviews";
import { site } from "@/lib/site";

export function StarRating({ value, size = 22 }: { value: number; size?: number }) {
  const stars = Array.from({ length: 5 });
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="flex opacity-20">
        {stars.map((_, i) => (
          <Star key={i} size={size} weight="fill" aria-hidden />
        ))}
      </span>
      <span className="absolute inset-0 flex overflow-hidden text-signal" style={{ width: `${(value / 5) * 100}%` }}>
        {stars.map((_, i) => (
          <Star key={i} size={size} weight="fill" className="shrink-0" aria-hidden />
        ))}
      </span>
    </span>
  );
}

export function Reviews({ index = "04" }: { index?: string }) {
  return (
    <section className="section-light relative overflow-hidden py-20 sm:py-28" aria-labelledby="reviews-title">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p data-reveal className="eyebrow">
            <span className="opacity-70">{index} /</span>Reviews
          </p>
          <h2 id="reviews-title" data-reveal style={{ "--i": 1 } as React.CSSProperties} className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Trusted by the neighborhood
          </h2>
          <div data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-8 flex items-end gap-5">
            <span className="display text-[6.5rem] leading-[0.8] text-ink">{site.rating.value}</span>
            <div className="pb-1.5">
              <StarRating value={site.rating.value} />
              <p className="mt-1.5 text-sm text-ink/70">
                Based on {site.rating.count} {site.rating.source} reviews
              </p>
            </div>
          </div>
          <div data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-8 flex flex-wrap gap-3">
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Read reviews on Google <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          </div>
        </div>

        {reviews.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.slice(0, 4).map((r, i) => (
              <li key={r.name} data-reveal style={{ "--i": i } as React.CSSProperties} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_1px_0_rgb(0_0_0/0.04)]">
                <Quotes size={28} weight="fill" className="text-signal" aria-hidden />
                <blockquote className="mt-3 text-ink/85">{r.text}</blockquote>
                <p className="mt-4 text-sm font-semibold">
                  {r.name}
                  {r.device && <span className="font-normal text-ink/60"> · {r.device}</span>}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p data-reveal className="font-mono text-xs tracking-[0.16em] text-ink/60 uppercase">
              What customers mention most
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {reviewThemes.map((t, i) => (
                <li key={t.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="group rounded-2xl border border-ink/10 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
                  <span className="font-mono text-xs text-signal-deep">0{i + 1}</span>
                  <h3 className="display mt-3 text-2xl">{t.title}</h3>
                  <p className="mt-2 text-ink/70">{t.body}</p>
                  <span className="mt-5 block h-0.5 w-10 bg-signal transition-[width] duration-500 group-hover:w-20" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
