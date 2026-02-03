import { NextResponse } from "next/server";
import { getAgent, getProofsByAgent } from "@/lib/data";
import { artifactIcon, artifactLabel } from "@/lib/utils";
import type { Proof } from "@/lib/types";

// GET /agent/:handle/feed.json - JSON export of agent proof (with pills and icons)
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
      total_proofs: agent.total_proofs,
    },
    proofs: proofsWithPills,
    exported_at: new Date().toISOString(),
  });
}
