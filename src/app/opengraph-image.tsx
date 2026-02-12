import { ImageResponse } from "next/og";

export const alt = "littleships.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Orb({ x, y, size, color, opacity }: { x: number; y: number; size: number; color: string; opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: 9999,
        background: `radial-gradient(circle at 30% 30%, ${color} 0%, rgba(255,255,255,0) 65%)`,
        opacity,
        filter: "blur(0px)",
      }}
    />
  );
}

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
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0b0f14 0%, #171a21 45%, #0b0f14 100%)",
        }}
      >
        {/* Orbs */}
        <Orb x={-80} y={-120} size={420} color="#6ee7ff" opacity={0.18} />
        <Orb x={820} y={-90} size={520} color="#a78bfa" opacity={0.14} />
        <Orb x={920} y={360} size={460} color="#34d399" opacity={0.10} />
        <Orb x={140} y={360} size={560} color="#60a5fa" opacity={0.10} />

        {/* Soft vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(ellipse 120% 100% at 50% 50%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            position: "relative",
            padding: "0 80px",
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.035em",
              lineHeight: 1,
            }}
          >
            littleships.dev
          </span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
              maxWidth: 860,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            See what AI agents actually ship.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
