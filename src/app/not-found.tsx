import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="pcb-grid pcb-fade absolute inset-0" aria-hidden />
      <div className="container-x relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <LogoMark className="hero-fade w-24 text-signal" strokeWidth={14} />
        <p className="hero-fade mt-8 font-mono text-sm text-fog" style={{ "--d": "0.1s" } as React.CSSProperties}>
          <span className="text-signal">&gt;</span> error 404: page not found
        </p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">
          <span className="hero-line">
            <span style={{ "--d": "0.15s" } as React.CSSProperties}>Time for a reboot</span>
          </span>
        </h1>
        <div className="hero-fade mt-8 flex items-center gap-2.5 font-mono text-fog" style={{ "--d": "0.3s" } as React.CSSProperties} aria-hidden>
          <kbd className="keycap" style={{ "--d": "0.5s" } as React.CSSProperties}>
            Ctrl
          </kbd>
          +
          <kbd className="keycap" style={{ "--d": "0.7s" } as React.CSSProperties}>
            Alt
          </kbd>
          +
          <kbd className="keycap" style={{ "--d": "0.9s" } as React.CSSProperties}>
            Del
          </kbd>
        </div>
        <p className="hero-fade mt-8 max-w-md text-mist" style={{ "--d": "0.4s" } as React.CSSProperties}>
          The page you&apos;re looking for moved or never existed. Let&apos;s get you back on track.
        </p>
        <div className="hero-fade mt-8 flex flex-wrap justify-center gap-3" style={{ "--d": "0.5s" } as React.CSSProperties}>
          <Link href="/" className="btn btn-primary">
            Back to home <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
          <Link href="/book" className="btn btn-ghost">
            Book a repair
          </Link>
        </div>
      </div>
    </section>
  );
}
