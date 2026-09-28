import { markOutline, markPads, markSpeaker, markTraces } from "@/components/brand/mark";

const chips = [
  { label: "SCREEN", x: 24, y: 90, trace: "M136 110 H170 L200 140 H229", edge: "M80 90 V56 L104 32 V0" },
  { label: "BATTERY", x: 24, y: 186, trace: "M136 206 H190", edge: "M24 206 H0" },
  { label: "PORTS", x: 24, y: 310, trace: "M136 330 H172 L202 300 H229" },
  { label: "KEYS", x: 504, y: 90, trace: "M504 110 H478 L443 145 V180" },
  { label: "DATA", x: 504, y: 253, trace: "M504 273 H440", edge: "M616 273 H640" },
  { label: "SOFTWARE", x: 504, y: 370, trace: "M504 390 H486 L436 340 H402", edge: "M560 410 V470 L536 494 V520" },
];

const buses = [
  "M290 122 V78 L268 56 V0",
  "M316 122 V0",
  "M342 122 V78 L364 56 V0",
  "M290 373 V420 L268 442 V520",
  "M316 373 V520",
  "M342 373 V420 L364 442 V520",
];

const vias = [
  [229, 140],
  [229, 300],
  [402, 340],
  [0, 206],
  [640, 273],
];

export function HeroBoard() {
  const traces = [...chips.map((c) => c.trace), ...buses];
  const edges = chips.flatMap((c) => (c.edge ? [c.edge] : []));

  return (
    <div id="hero-board" data-anim className="relative">
      <div className="card pcb-grid relative overflow-hidden rounded-3xl border-line/80 bg-panel/60 p-3 sm:p-5">
        <svg viewBox="0 0 640 520" className="board block h-auto w-full" role="img" aria-label="Animated circuit board built around the CTRL ALT DEL phone logo, with signals flowing to screen, battery, ports, keys, data and software chips">
          <defs>
            <radialGradient id="board-glow">
              <stop offset="0" stopColor="#ea5400" stopOpacity="0.38" />
              <stop offset="1" stopColor="#ea5400" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle className="glow" cx="316" cy="248" r="190" fill="url(#board-glow)" />

          {[...traces, ...edges].map((d) => (
            <path key={`t-${d}`} d={d} className="trace" />
          ))}
          {traces.map((d, i) => (
            <path key={`l-${d}`} d={d} pathLength={1} className="trace-lit" style={{ "--d": `${1.7 + i * 0.09}s` } as React.CSSProperties} />
          ))}
          {traces.map((d, i) => (
            <path
              key={`p-${d}`}
              d={d}
              pathLength={1}
              className="pulse"
              style={{ "--d": `${2.9 + ((i * 0.53) % 3)}s`, "--dur": `${2.6 + (i % 4) * 0.45}s` } as React.CSSProperties}
            />
          ))}

          {vias.map(([cx, cy]) => (
            <circle key={`v-${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="#0a0a0b" stroke="#3a3a42" strokeWidth="2" />
          ))}

          {chips.map((c, i) => (
            <g key={c.label}>
              {[16, 36, 56, 76, 96].map((px) => (
                <g key={px} fill="#2a2a30">
                  <rect x={c.x + px} y={c.y - 6} width="6" height="6" rx="1" />
                  <rect x={c.x + px} y={c.y + 40} width="6" height="6" rx="1" />
                </g>
              ))}
              <rect x={c.x} y={c.y} width="112" height="40" rx="7" className="chip-box" style={{ "--d": `${2.1 + i * 0.1}s` } as React.CSSProperties} />
              <circle cx={c.x + 14} cy={c.y + 20} r="3.5" className="led" style={{ "--d": `${2.3 + i * 0.1}s` } as React.CSSProperties} />
              <text x={c.x + 62} y={c.y + 24.5} textAnchor="middle" fill="#a1a1aa" fontSize="11" letterSpacing="2" style={{ fontFamily: "var(--font-electrolize)" }}>
                {c.label}
              </text>
            </g>
          ))}

          <g transform="translate(184 120) scale(0.62)" strokeWidth="11">
            {[...markOutline, markSpeaker, ...markTraces].map((d, i) => (
              <path key={`m-${d}`} d={d} pathLength={1} className="mark" style={{ "--d": `${0.9 + i * 0.07}s` } as React.CSSProperties} />
            ))}
            {markPads.map((p, i) => (
              <circle key={`pad-${p.cx}`} {...p} pathLength={1} className="mark" style={{ "--d": `${1.3 + i * 0.08}s` } as React.CSSProperties} />
            ))}
            {markTraces.map((d, i) => (
              <path key={`mp-${d}`} d={d} pathLength={1} className="pulse" style={{ "--d": `${3.2 + i * 0.6}s`, "--dur": "2.4s" } as React.CSSProperties} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
