import { NextResponse } from "next/server";
import { SubmitReceiptPayload } from "@/lib/types";
import { enrichProof } from "@/lib/enrich";
import { insertReceipt, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { inferShipTypeFromArtifact } from "@/lib/utils";
import { verifyProofSignature } from "@/lib/auth";
import type { ArtifactType } from "@/lib/types";

function inferArtifactType(value: string): ArtifactType {
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "contract";
  if (value.includes("github.com")) return "github";
  if (value.startsWith("ipfs://") || value.includes("/ipfs/")) return "ipfs";
  if (value.includes("arweave.net") || value.startsWith("ar://")) return "arweave";
  if (value.startsWith("http://") || value.startsWith("https://")) return "link";
  return "link";
}

// POST /api/proof - Submit a new proof (per SPEC §7.2); enriches proof per §3.3
export async function POST(request: Request) {
  try {
    const payload: SubmitReceiptPayload = await request.json();

    if (!payload.agent_id || !payload.title || !payload.proof?.length) {
      return NextResponse.json(
        { error: "Missing required fields: agent_id, title, proof" },
        { status: 400 }
      );
    }

    if (payload.proof.length > 10) {
      return NextResponse.json(
        { error: "Proof must be 1–10 items" },
        { status: 400 }
      );
    }

    const agent = await getAgent(payload.agent_id);
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    if (!verifyProofSignature(payload, agent.public_key)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const primaryType = inferArtifactType(payload.proof[0].value) || payload.proof[0].type || "link";
    const ship_type =
      typeof payload.ship_type === "string" && payload.ship_type.trim()
        ? payload.ship_type.trim().toLowerCase().replace(/\s+/g, "_")
        : inferShipTypeFromArtifact(primaryType);

    const { status, enriched_card, proof: proofItems } = await enrichProof(
      payload.proof,
      primaryType,
      payload.title
    );

    const receipt_id = `SHP-${crypto.randomUUID()}`;
    const changelog = Array.isArray(payload.changelog) && payload.changelog.length > 0
      ? payload.changelog.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 20)
      : undefined;
    const proof = {
      receipt_id,
      agent_id: payload.agent_id,
      title: payload.title,
      ship_type,
      artifact_type: primaryType,
      proof: proofItems,
      timestamp: new Date().toISOString(),
      status,
      enriched_card,
      changelog: changelog?.length ? changelog : undefined,
    };

    if (hasDb()) {
      try {
        await insertReceipt(proof);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Failed to store proof" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      proof_id: receipt_id,
      proof_url: `/proof/${receipt_id}`,
      proof,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
