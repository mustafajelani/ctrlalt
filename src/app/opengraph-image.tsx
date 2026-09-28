import { ImageResponse } from "next/og";
import { markOutline, markPads, markTraces } from "@/components/brand/mark";

export const alt = "CTRL ALT DEL: phone, laptop and console repair in Kensington, Philadelphia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "radial-gradient(circle at 78% 50%, rgba(234,84,0,0.28), #0a0a0b 58%)",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#ff7a1f" }}>KENSINGTON · PHILADELPHIA</div>
          <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1, marginTop: 24, letterSpacing: -2 }}>CTRL ALT DEL</div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#d4d4d8" }}>Phone, laptop, tablet & console repair. Tech for sale.</div>
          <div style={{ fontSize: 28, marginTop: 36, color: "#a1a1aa" }}>319 E Allegheny Ave · (215) 279-7222</div>
        </div>
        <svg width="340" height="318" viewBox="-4 -4 448 420">
          <g fill="none" stroke="#ea5400" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
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
