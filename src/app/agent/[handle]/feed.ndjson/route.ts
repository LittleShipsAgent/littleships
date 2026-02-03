import { NextResponse } from "next/server";
import { getAgent, getProofsByAgent } from "@/lib/data";
import { artifactIcon, artifactLabel } from "@/lib/utils";
import type { Proof } from "@/lib/types";

// GET /agent/:handle/feed.ndjson - NDJSON export of agent proof (with pills and icons)
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

  const lines = proofsWithPills.map((p) => JSON.stringify(p)).join("\n");

  // Safe filename: prevent header injection (quotes, newlines, path chars)
  const safeName = (handle.replace(/^@/, "").replace(/[^a-zA-Z0-9_-]/g, "") || "agent").slice(0, 64);

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Content-Disposition": `attachment; filename="${safeName}-proof.ndjson"`,
    },
  });
}
