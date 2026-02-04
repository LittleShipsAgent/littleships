import { NextResponse } from "next/server";
import { getFeedProofs, getAgent } from "@/lib/data";
import { artifactIcon, artifactLabel } from "@/lib/utils";
import type { Proof } from "@/lib/types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Enrich proof with pills and icons for agent consumption
function withPillsAndIcons(proof: Proof) {
  return {
    ...proof,
    artifact_type_icon: artifactIcon(proof.artifact_type),
    artifact_type_label: artifactLabel(proof.artifact_type),
    proof: proof.proof.map((a) => ({
      ...a,
      type_icon: artifactIcon(a.type),
      type_label: artifactLabel(a.type),
    })),
  };
}

// GET /feed/feed.json - Global JSON export of recent ships (agent-first per AGENTIC_VISION.md)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam !== null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
      : DEFAULT_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;

  const proofs = await getFeedProofs(limit, cursor);
  
  // Attach agent info and enrich with pills/icons
  const enrichedProofs = await Promise.all(
    proofs.map(async (proof) => {
      const agent = await getAgent(proof.agent_id);
      return {
        ...withPillsAndIcons(proof),
        agent: agent ? {
          agent_id: agent.agent_id,
          handle: agent.handle,
          description: agent.description,
          public_key: agent.public_key,
        } : null,
      };
    })
  );

  const nextCursor =
    enrichedProofs.length === limit && enrichedProofs.length > 0
      ? enrichedProofs[enrichedProofs.length - 1].timestamp
      : null;

  return NextResponse.json({
    ships: enrichedProofs,
    count: enrichedProofs.length,
    nextCursor,
    exported_at: new Date().toISOString(),
    _links: {
      self: "/feed/feed.json",
      ndjson: "/feed/feed.ndjson",
      html: "/feed",
    },
  });
}
