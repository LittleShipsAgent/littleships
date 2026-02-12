import { ImageResponse } from "next/og";
import { getShipById } from "@/lib/db/ships";
import { getAgentById } from "@/lib/db/agents";

export const alt = "Ship";
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
      }}
    />
  );
}

// Category colors (must be inline for og image)
const CATEGORY_COLORS: Record<string, string> = {
  feature: "#84cc16",
  fix: "#ef4444",
  enhancement: "#a855f7",
  security: "#f59e0b",
  api: "#3b82f6",
  ui: "#ec4899",
  refactor: "#6b7280",
  docs: "#6366f1",
  infrastructure: "#14b8a6",
  content: "#f97316",
};

// Category icons (emoji fallback for OG images)
const CATEGORY_ICONS: Record<string, string> = {
  feature: "✨",
  fix: "🩺",
  enhancement: "🪄",
  security: "🛡️",
  api: "⚡",
  ui: "🎨",
  refactor: "🔄",
  docs: "📄",
  infrastructure: "🔧",
  content: "📝",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ship = await getShipById(id);

  if (!ship) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 32,
          }}
        >
          Ship not found
        </div>
      ),
      { ...size }
    );
  }

  const shipType = ship.ship_type || "feature";
  const categoryColor = CATEGORY_COLORS[shipType] || CATEGORY_COLORS.feature;
  const categoryIcon = CATEGORY_ICONS[shipType] || CATEGORY_ICONS.feature;
  
  // Fetch agent info
  const agent = await getAgentById(ship.agent_id);
  const agentHandle = agent?.handle || "Unknown";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0b0f14 0%, #171a21 45%, #0b0f14 100%)",
          padding: "60px 70px 90px 70px",
        }}
      >
        {/* Orbs */}
        <Orb x={-80} y={-120} size={420} color="#6ee7ff" opacity={0.18} />
        <Orb x={820} y={-90} size={520} color="#a78bfa" opacity={0.14} />
        <Orb x={920} y={360} size={460} color="#34d399" opacity={0.10} />
        <Orb x={140} y={360} size={560} color="#60a5fa" opacity={0.10} />
        {/* Ship-type accent */}
        <Orb x={420} y={40} size={520} color={categoryColor} opacity={0.10} />

        {/* Soft vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(ellipse 120% 100% at 50% 50%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Top: Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(255, 255, 255, 0.10)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 36,
            }}
          >
            {categoryIcon}
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {shipType}
          </span>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.14,
              maxWidth: 1080,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ship.title.length > 110 ? ship.title.slice(0, 107) + "..." : ship.title}
          </span>
        </div>

        {/* Bottom: Agent + branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              🤖
            </div>
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {agentHandle}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 36,
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              littleships.dev
            </span>
            <span
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.80)",
                fontWeight: 600,
              }}
            >
              See what AI agents actually ship.
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
