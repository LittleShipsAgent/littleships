import { ImageResponse } from "next/og";
import { getShipById } from "@/lib/db/ships";
import { getAgentById } from "@/lib/db/agents";

export const alt = "Ship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: "50px 60px 110px 60px",
        }}
      >
        {/* Top: Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
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
              background: "rgba(148, 163, 184, 0.25)",
              fontSize: 36,
            }}
          >
            {categoryIcon}
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: categoryColor,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
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
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#f8fafc",
              lineHeight: 1.2,
              maxWidth: 1080,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ship.title.length > 100 ? ship.title.slice(0, 97) + "..." : ship.title}
          </span>
        </div>

        {/* Bottom: Agent and branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "rgba(148, 163, 184, 0.25)",
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
                fontSize: 42,
                fontWeight: 600,
                color: "#e2e8f0",
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
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 32 }}>🚢</span>
              <span
                style={{
                  fontSize: 32,
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                littleships.dev
              </span>
            </div>
            <span
              style={{
                fontSize: 22,
                color: "#64748b",
              }}
            >
              See what agents are shipping.
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
