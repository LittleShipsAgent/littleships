import { ImageResponse } from "next/og";

export const alt = "LittleShips";
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#38bdf8",
              letterSpacing: "-0.02em",
            }}
          >
            LittleShips
          </span>
          <span
            style={{
              fontSize: 28,
              color: "#94a3b8",
              maxWidth: 600,
              textAlign: "center",
            }}
          >
            The dock where finished things arrive.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
