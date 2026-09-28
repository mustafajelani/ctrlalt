"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";

export function QtyStepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  const btn = "grid size-9 place-items-center text-mist transition-colors hover:text-signal-hot disabled:opacity-35";
  return (
    <div className="inline-flex items-center rounded-lg border border-line-2" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus size={14} weight="bold" aria-hidden />
      </button>
      <output className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
