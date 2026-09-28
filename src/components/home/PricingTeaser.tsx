import { ArrowUpRight, BatteryFull, DeviceMobile, GameController, Keyboard } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { SectionHeading, type HeadingTier } from "@/components/ui/SectionHeading";
import { pricing } from "@/content/pricing";
import { money } from "@/content/products";

const picks = [
  { device: "phone", name: "Screen replacement", icon: DeviceMobile, label: "Phone screen" },
  { device: "phone", name: "Battery replacement", icon: BatteryFull, label: "Phone battery" },
  { device: "laptop", name: "Broken key repair", icon: Keyboard, label: "Laptop keys" },
  { device: "console", name: "HDMI port replacement", icon: GameController, label: "Console HDMI" },
] as const;

export function PricingTeaser({ code = "R3", tier = "secondary" }: { code?: string; tier?: HeadingTier } = {}) {
  const rows = picks.map((p) => ({
    ...p,
    row: pricing.find((g) => g.device === p.device)?.rows.find((r) => r.name === p.name),
  }));

  return (
    <section className="container-x py-16 sm:py-28" aria-labelledby="pricing-title">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <SectionHeading
            code={code}
            tier={tier}
            eyebrow="Upfront pricing"
            title={<span id="pricing-title">Know the price before we pick up a screwdriver</span>}
            intro="Starting prices for our most common repairs. Your exact quote depends on the model, and you approve it before any work begins."
          />
          <Link data-reveal href="/pricing" className="btn btn-ghost mt-8">
            See full price list <ArrowUpRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {rows.map(({ label, icon: Icon, row, device }, i) => (
            <li key={label} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/book?device=${device}&issue=${row?.issue ?? "other"}&repair=${encodeURIComponent(label)}`}
                aria-label={`${label}, from ${row?.from != null ? money(row.from) : "a quote"}. Book this repair`}
                data-link-card
                className="group card relative flex h-full flex-col overflow-hidden p-4 transition-colors duration-300 hover:border-signal/60 sm:p-6"
              >
                <span className="absolute -top-16 -right-16 size-40 rounded-full bg-signal/0 blur-2xl transition-colors duration-500 group-hover:bg-signal/20" aria-hidden />
                <Icon size={26} className="text-signal sm:size-[30px]" aria-hidden />
                <span className="mt-4 text-sm text-fog sm:mt-6">{label}</span>
                <span className="mt-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="text-xs tracking-wider text-fog uppercase">from</span>
                  <span className="display text-4xl sm:text-5xl">{row?.from != null ? money(row.from) : "Quote"}</span>
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-signal-hot sm:mt-5">
                  <span className="sm:hidden">Book</span>
                  <span className="hidden sm:inline">Book this repair</span>
                  <ArrowUpRight size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
