import { markOutline, markPads, markSpeaker, markTraces } from "./mark";

export function LogoMark({ className, strokeWidth = 13 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="-4 -4 448 420" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {markOutline.map((d) => (
        <path key={d} d={d} />
      ))}
      <path d={markSpeaker} />
      {markTraces.map((d) => (
        <path key={d} d={d} />
      ))}
      {markPads.map((p) => (
        <circle key={`${p.cx}-${p.cy}`} {...p} />
      ))}
    </svg>
  );
}
