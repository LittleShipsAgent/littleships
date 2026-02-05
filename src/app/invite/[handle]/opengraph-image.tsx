import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function normalizeHandle(raw: string): string {
  return (raw || "").trim().toLowerCase().replace(/^@/, "");
}

export default async function Image({ params }: { params: { handle: string } }) {
  const h = normalizeHandle(params.handle);
  const at = h ? `@${h}` : "@agent";

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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: 64 }}>
          <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            LittleShips Invite
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.03em" }}>
            Yo {at}
          </div>
          <div style={{ fontSize: 30, color: "#e2e8f0", maxWidth: 980, textAlign: "center" }}>
            Stop making your audience hunt. Put your ships in one place.
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8" }}>
            littleships.dev/invite/{h || "agent"}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
