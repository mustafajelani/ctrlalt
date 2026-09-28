"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pricing } from "@/content/pricing";
import { money } from "@/content/products";

export function PricingTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = pricing.findIndex((g) => `#${g.device}` === window.location.hash);
    if (idx >= 0) setActive(idx);
  }, []);

  function select(i: number, focus = false) {
    setActive(i);
    history.replaceState(null, "", `#${pricing[i].device}`);
    if (focus) tabs.current[i]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const last = pricing.length - 1;
    const map: Record<string, number> = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  }

  const group = pricing[active];

  return (
    <div>
      <div role="tablist" aria-label="Device type" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {pricing.map((g, i) => (
          <button
            key={g.device}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${g.device}`}
            aria-selected={i === active}
            aria-controls={`panel-${g.device}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="chip shrink-0"
          >
            {g.label}
          </button>
        ))}
      </div>

      <div
        key={group.device}
        role="tabpanel"
        id={`panel-${group.device}`}
        aria-labelledby={`tab-${group.device}`}
        tabIndex={0}
        className="card mt-6 overflow-hidden [animation:fade-up_0.5s_var(--ease-out-expo)_both]"
      >
        <table className="w-full text-left">
          <caption className="sr-only">{group.label} repair starting prices</caption>
          <thead className="border-b border-line font-mono text-xs tracking-[0.14em] text-fog uppercase">
            <tr>
              <th scope="col" className="px-5 py-4 font-normal sm:px-7">
                Repair
              </th>
              <th scope="col" className="px-5 py-4 text-right font-normal sm:px-7">
                Starting at
              </th>
              <th scope="col" className="hidden px-7 py-4 sm:table-cell">
                <span className="sr-only">Book</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {group.rows.map((row) => (
              <tr key={row.name} className="group transition-colors hover:bg-panel-2">
                <th scope="row" className="px-5 py-5 font-normal sm:px-7">
                  <span className="block font-semibold">{row.name}</span>
                  {row.note && <span className="mt-0.5 block text-sm text-fog">{row.note}</span>}
                  <Link href={`/book?device=${group.device}&issue=${row.issue}&repair=${encodeURIComponent(row.name)}`} className="mt-2 inline-flex text-sm font-semibold text-signal-hot sm:hidden">
                    Book this repair
                  </Link>
                </th>
                <td className="px-5 py-5 text-right align-top whitespace-nowrap sm:px-7 sm:align-middle">
                  <span className="font-mono text-lg tabular-nums">{row.from != null ? money(row.from) : "Ask us"}</span>
                  {row.plusParts && <span className="block text-xs text-fog">+ parts</span>}
                </td>
                <td className="hidden px-7 py-5 text-right sm:table-cell">
                  <Link
                    href={`/book?device=${group.device}&issue=${row.issue}&repair=${encodeURIComponent(row.name)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-hot opacity-70 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={`Book ${group.label.toLowerCase()} ${row.name.toLowerCase()}`}
                  >
                    Book <ArrowRight size={14} weight="bold" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
