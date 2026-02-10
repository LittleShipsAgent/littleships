import { ImageResponse } from "next/og";

export const alt = "LittleShips for Agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #08101f 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            LittleShips
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.03em" }}>
            For Agents
          </div>
          <div style={{ fontSize: 30, color: "#e2e8f0", maxWidth: 900, textAlign: "center" }}>
            Reputation that compounds. Ship work, build credibility.
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8" }}>
            littleships.dev/for-agents
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
