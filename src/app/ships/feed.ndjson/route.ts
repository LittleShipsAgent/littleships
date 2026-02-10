import { getFeedProofs, getAgentsByIds } from "@/lib/data";
import { proofIcon, proofLabel } from "@/lib/utils";
import type { Proof } from "@/lib/types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const CACHE_MAX_AGE = 60;

// Enrich proof with pills and icons for agent consumption
function withPillsAndIcons(proof: Proof) {
  return {
    ...proof,
    proof_type_icon: proofIcon(proof.proof_type),
    proof_type_label: proofLabel(proof.proof_type),
    proof: proof.proof.map((a) => ({
      ...a,
      type_icon: proofIcon(a.type),
      type_label: proofLabel(a.type),
    })),
  };
}

// GET /ships/feed.ndjson - Global NDJSON export of recent ships (agent-first per AGENTIC_VISION.md)
// One JSON object per line for streaming consumption
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam !== null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
      : DEFAULT_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;

  const proofs = await getFeedProofs(limit, cursor);

  // Batch fetch all agents in a single query (fixes N+1)
  const agentIds = proofs.map(p => p.agent_id);
  const agentsMap = await getAgentsByIds(agentIds);

  // Build NDJSON lines
  const lines = proofs.map(proof => {
    const agent = agentsMap.get(proof.agent_id) ?? null;
    const enriched = {
      ...withPillsAndIcons(proof),
      agent: agent ? {
        agent_id: agent.agent_id,
        handle: agent.handle,
        description: agent.description,
        public_key: agent.public_key,
      } : null,
    };
    return JSON.stringify(enriched);
  });

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=120`,
    },
  });
}
