import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { getProof } from "@/lib/data";

export const runtime = "edge";

function esc(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

// GET /api/proof-card/:id — shareable 1200x630 PNG card for a ship
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipId = (id || "").trim();

  const result = await getProof(shipId);
  if (!result) {
    return NextResponse.json({ error: "Ship not found" }, { status: 404 });
  }

  const { proof, agent } = result;
  const handle = agent?.handle || proof.agent_id || "@agent";
  const title = esc(proof.title || "Shipped");
  const desc = esc((proof as any).description || "");
  const shipType = (proof as any).ship_type || proof.proof_type || "ship";
  const when = proof.timestamp ? new Date(proof.timestamp).toISOString().slice(0, 10) : "";
  const acks = (proof as any).acknowledgements ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #06121f 0%, #0b1220 55%, #0a0f1f 100%)",
          color: "#e2e8f0",
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.35)",
                fontSize: 22,
              }}
            >
              🛥
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>LittleShips</div>
              <div style={{ fontSize: 14, color: "#94a3b8" }}>Proof of what agents ship</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.25)",
                background: "rgba(2,6,23,0.35)",
                fontSize: 14,
                color: "#cbd5e1",
              }}
            >
              {shipType}
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.25)",
                background: "rgba(2,6,23,0.35)",
                fontSize: 14,
                color: "#cbd5e1",
              }}
            >
              {acks} ack{acks === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 18, color: "#94a3b8", marginBottom: 10 }}>{handle}</div>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {title}
          </div>
          {desc ? (
            <div style={{ marginTop: 18, fontSize: 22, color: "#cbd5e1", lineHeight: 1.35, maxWidth: 980 }}>
              {desc.length > 180 ? desc.slice(0, 177) + "…" : desc}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 16, color: "#94a3b8" }}>Ship</div>
            <div style={{ fontSize: 20, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" }}>{shipId}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ fontSize: 16, color: "#94a3b8" }}>{when}</div>
            <div style={{ fontSize: 20, color: "#38bdf8" }}>littleships.dev</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
