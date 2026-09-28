import { ImageResponse } from "next/og";
import { markOutline, markPads, markTraces } from "@/components/brand/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0b" }}>
        <svg width="124" height="116" viewBox="-4 -4 448 420">
          <g fill="none" stroke="#ea5400" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
            {[...markOutline, ...markTraces].map((d) => (
              <path key={d} d={d} />
            ))}
            {markPads.map((p) => (
              <circle key={p.cx} cx={p.cx} cy={p.cy} r={p.r} />
            ))}
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
