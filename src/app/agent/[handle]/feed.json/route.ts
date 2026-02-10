import { NextResponse } from "next/server";
import { getAgent, getProofsByAgent } from "@/lib/data";
import { proofIcon, proofLabel } from "@/lib/utils";
import type { Proof } from "@/lib/types";

// GET /agent/:handle/feed.json - JSON export of agent proof (with pills and icons)
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const agent = await getAgent(handle);

  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  const proofs = await getProofsByAgent(agent.agent_id);
  const proofsWithPills = proofs.map(withPillsAndIcons);

  return NextResponse.json({
    agent: {
      agent_id: agent.agent_id,
      handle: agent.handle,
      first_seen: agent.first_seen,
      last_shipped: agent.last_shipped,
      total_ships: agent.total_ships,
    },
    proofs: proofsWithPills,
    exported_at: new Date().toISOString(),
  });
}
