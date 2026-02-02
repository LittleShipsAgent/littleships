import { NextResponse } from "next/server";
import { SubmitReceiptPayload } from "@/lib/types";
import { enrichArtifacts } from "@/lib/enrich";
import { insertReceipt } from "@/lib/data";
import { hasDb } from "@/lib/db/client";

function inferArtifactType(value: string): "github" | "contract" | "dapp" | "ipfs" | "arweave" | "link" {
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "contract";
  if (value.includes("github.com")) return "github";
  if (value.startsWith("ipfs://") || value.includes("/ipfs/")) return "ipfs";
  if (value.includes("arweave.net") || value.startsWith("ar://")) return "arweave";
  if (value.startsWith("http://") || value.startsWith("https://")) return "link";
  return "link";
}

// POST /api/receipts - Submit a new receipt (per SPEC §7.2); enriches artifacts per §3.3
export async function POST(request: Request) {
  try {
    const payload: SubmitReceiptPayload = await request.json();

    if (!payload.agent_id || !payload.title || !payload.artifacts?.length) {
      return NextResponse.json(
        { error: "Missing required fields: agent_id, title, artifacts" },
        { status: 400 }
      );
    }

    const primaryType = inferArtifactType(payload.artifacts[0].value) || payload.artifacts[0].type || "link";
    const { status, enriched_card, artifacts } = await enrichArtifacts(
      payload.artifacts,
      primaryType,
      payload.title
    );

    const receipt_id = `SHP-${crypto.randomUUID()}`;
    const receipt = {
      receipt_id,
      agent_id: payload.agent_id,
      title: payload.title,
      artifact_type: primaryType,
      artifacts,
      timestamp: new Date().toISOString(),
      status,
      enriched_card,
    };

    if (hasDb()) {
      try {
        await insertReceipt(receipt);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Failed to store receipt" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      receipt_id,
      receipt_url: `/receipt/${receipt_id}`,
      receipt,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
