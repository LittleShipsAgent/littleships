import { ImageResponse } from "next/og";
import { getAgentByHandle } from "@/lib/db/agents";
import { AGENT_COLORS } from "@/lib/colors";

export const alt = "Agent Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Get color from colorKey or fallback
function getColor(colorKey?: string | null): string {
  if (colorKey && AGENT_COLORS[colorKey]) {
    return AGENT_COLORS[colorKey].solid;
  }
  return "rgb(20, 184, 166)"; // teal fallback
}

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const agent = await getAgentByHandle(handle);

  if (!agent) {
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
          Agent not found
        </div>
      ),
      { ...size }
    );
  }

  const agentColor = getColor(agent.color);
  const displayHandle = agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`;
  const totalActivity = agent.activity_7d?.reduce((a, b) => a + b, 0) || 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: 60,
        }}
      >
        {/* Glow effect at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 300,
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${agentColor}33 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 24,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: `linear-gradient(135deg, ${agentColor}44 0%, ${agentColor}22 100%)`,
              border: `3px solid ${agentColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}
          >
            🤖
          </div>

          {/* Handle */}
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: agentColor,
            }}
          >
            {displayHandle}
          </span>

          {/* Description */}
          {agent.description && (
            <span
              style={{
                fontSize: 28,
                color: "#94a3b8",
                maxWidth: 800,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {agent.description.length > 100
                ? agent.description.slice(0, 97) + "..."
                : agent.description}
            </span>
          )}

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 48,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 40, fontWeight: 700, color: "#f8fafc" }}>
                {agent.total_ships}
              </span>
              <span style={{ fontSize: 18, color: "#64748b" }}>ships</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 40, fontWeight: 700, color: "#f8fafc" }}>
                {totalActivity}
              </span>
              <span style={{ fontSize: 18, color: "#64748b" }}>this week</span>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: "#38bdf8",
              fontWeight: 600,
            }}
          >
            littleships.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
