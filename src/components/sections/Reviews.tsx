import { ArrowUpRight, Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import { SectionHeading, type HeadingTier } from "@/components/ui/SectionHeading";
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
      <span className="star-fill absolute inset-0 flex overflow-hidden text-signal" style={{ width: `${(value / 5) * 100}%` }}>
        {stars.map((_, i) => (
          <Star key={i} size={size} weight="fill" className="shrink-0" aria-hidden />
        ))}
      </span>
    </span>
  );
}

const t = {
  section: "border-y border-line bg-ink-2",
  number: "text-white",
  muted: "text-fog",
  label: "text-fog",
  card: "card",
  cardIndex: "text-signal-hot",
  button: "btn-ghost",
} as const;

export function Reviews({ code = "Q5", tier = "secondary" }: { code?: string; tier?: HeadingTier }) {
  return (
    <section className={`relative overflow-hidden py-16 sm:py-28 ${t.section}`} aria-labelledby="reviews-title">
      <div className="pcb-grid pcb-fade absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative grid gap-10 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading code={code} tier={tier} eyebrow="Reviews" title={<span id="reviews-title">Trusted by the neighborhood</span>} />
          <div data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-8 flex items-end gap-5">
            <span className={`display text-[5rem] leading-[0.8] sm:text-[6.5rem] ${t.number}`}>{site.rating.value}</span>
            <div className="pb-1.5">
              <StarRating value={site.rating.value} />
              <p className={`mt-1.5 text-sm ${t.muted}`}>
                Based on {site.rating.count} {site.rating.source} reviews
              </p>
            </div>
          </div>
          <div data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-8 flex flex-wrap gap-3">
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`btn ${t.button}`}>
              Read reviews on Google <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          </div>
        </div>

        {reviews.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.slice(0, 4).map((r, i) => (
              <li key={r.name} data-reveal style={{ "--i": i } as React.CSSProperties} className={`p-6 ${t.card}`}>
                <Quotes size={28} weight="fill" className="text-signal" aria-hidden />
                <blockquote className="mt-3">{r.text}</blockquote>
                <p className="mt-4 text-sm">
                  {r.name}
                  {r.device && <span className={t.muted}> · {r.device}</span>}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p data-reveal className={`font-mono text-xs tracking-[0.16em] uppercase ${t.label}`}>
              What customers mention most
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {reviewThemes.map((theme, i) => (
                <li key={theme.title} data-reveal style={{ "--i": i } as React.CSSProperties} className={`p-4 sm:p-6 ${t.card}`}>
                  <span className={`font-mono text-xs ${t.cardIndex}`}>0{i + 1}</span>
                  <h3 className="display mt-2 text-lg sm:mt-3 sm:text-2xl">{theme.title}</h3>
                  <p className={`mt-2 text-sm sm:text-base ${t.muted}`}>{theme.body}</p>
                  <span className="mt-4 block h-0.5 w-10 bg-signal sm:mt-5" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
