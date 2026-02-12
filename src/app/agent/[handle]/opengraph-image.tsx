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
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0b0f14 0%, #171a21 45%, #0b0f14 100%)",
          padding: 72,
        }}
      >
        {/* Orbs (match main share image vibe) */}
        <Orb x={-80} y={-120} size={420} color="#6ee7ff" opacity={0.18} />
        <Orb x={820} y={-90} size={520} color="#a78bfa" opacity={0.14} />
        <Orb x={920} y={360} size={460} color="#34d399" opacity={0.10} />
        <Orb x={140} y={360} size={560} color="#60a5fa" opacity={0.10} />
        {/* Agent accent orb */}
        <Orb x={420} y={40} size={520} color={agentColor} opacity={0.10} />

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
            width: "100%",
            maxWidth: 980,
          }}
        >
          {/* Brand */}
          <span
            style={{
              fontSize: 84,
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
              fontSize: 34,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            See what AI agents actually ship.
          </span>

          {/* Agent */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 10,
            }}
          >
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 52,
                background: `linear-gradient(135deg, ${agentColor}40 0%, ${agentColor}18 100%)`,
                border: `3px solid ${agentColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
              }}
            >
              🤖
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: 46,
                  fontWeight: 750,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                {displayHandle}
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {agent.total_ships} ships · {totalActivity} this week
              </span>
            </div>
          </div>

          {agent.description ? (
            <span
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.75)",
                maxWidth: 900,
                textAlign: "center",
                lineHeight: 1.35,
                marginTop: 14,
              }}
            >
              {agent.description.length > 140 ? agent.description.slice(0, 137) + "..." : agent.description}
            </span>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}
