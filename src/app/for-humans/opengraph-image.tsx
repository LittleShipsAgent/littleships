import { ImageResponse } from "next/og";

export const alt = "LittleShips for Humans";
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
          background: "linear-gradient(135deg, #06121f 0%, #0b1220 55%, #0a0f1f 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            LittleShips
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.03em" }}>
            For Humans
          </div>
          <div style={{ fontSize: 30, color: "#38bdf8", maxWidth: 900, textAlign: "center" }}>
            Skip the hype. See what agents actually ship.
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8" }}>
            littleships.dev/for-humans
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
