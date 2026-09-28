import { SectionHeading, type HeadingTier } from "@/components/ui/SectionHeading";
import { processSteps } from "@/content/services";

export function ProcessSteps({ code = "J2", tier = "secondary" }: { code?: string; tier?: HeadingTier } = {}) {
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2 py-16 sm:py-28" aria-labelledby="process-title">
      <div className="pcb-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          code={code}
          tier={tier}
          eyebrow="How it works"
          align="center"
          title={<span id="process-title">From broken to back in action</span>}
          intro="Four simple steps. No surprises on price, and you can follow your repair online the whole way."
        />

        <ol data-reveal="fade" className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-line-2 md:block" aria-hidden />
          <span className="trace-grow absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-signal to-signal-hot shadow-[0_0_12px_rgb(255_122_31/0.7)] md:block" aria-hidden />
          <span className="absolute top-0 bottom-0 left-7 w-px bg-line-2 md:hidden" aria-hidden />
          <span className="trace-grow-y absolute top-0 bottom-0 left-7 w-px bg-gradient-to-b from-signal to-signal-hot md:hidden" aria-hidden />

          {processSteps.map((step, i) => (
            <li key={step.title} className="relative flex gap-6 md:flex-col md:items-center md:gap-0 md:text-center">
              <span
                className="step-node relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-line-2 bg-ink font-mono text-sm text-fog"
                style={{ "--i": i } as React.CSSProperties}
              >
                0{i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className="display text-2xl">{step.title}</h3>
                <p className="mt-2 text-fog md:mx-auto md:max-w-[15rem]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
