import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "58px 68px", background: "#0c120f", color: "#f3f8f4", fontFamily: "sans-serif", border: "2px solid #254633" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
            <path d="M5 38C11 38 15 33 20 26C25 19 30 12 40 10" stroke="#a3e635" strokeWidth="3.2" opacity="0.3" />
            <path d="M34 9.5L41 9.5L40 16.5" stroke="#a3e635" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="21.5" cy="13" r="4.4" fill="#a3e635" />
            <path d="M21 19.5L19.5 28M19.5 28L15 38M19.5 28L26 33.5L28.5 40M21.5 21.5L29 19" stroke="#a3e635" strokeWidth="3.8" strokeLinecap="round" />
            <rect x="28.5" y="17.5" width="9.5" height="7" rx="1.6" fill="#a3e635" />
          </svg>
          <span style={{ fontSize: 38, fontWeight: 700 }}>Job Alert 24</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 42, fontSize: 68, fontWeight: 700, lineHeight: 1.12, letterSpacing: -2 }}>
          <span>Your next career move</span>
          <span style={{ color: "#a3e635" }}>starts here.</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 27, color: "#b7c7bd" }}>
          Tech jobs. Stronger resumes. Better interview prep.
        </div>
        <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #2c4334", paddingTop: 24 }}>
          <span style={{ fontSize: 22, color: "#a3e635" }}>jobalerts24.com</span>
          <span style={{ fontSize: 20, color: "#b7c7bd" }}>Find. Prepare. Apply.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
