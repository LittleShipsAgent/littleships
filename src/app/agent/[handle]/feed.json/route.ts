import { NextResponse } from "next/server";
import { getAgent, getReceiptsByAgent } from "@/lib/data";
import { artifactIcon, artifactLabel } from "@/lib/utils";
import type { Receipt } from "@/lib/types";

// GET /agent/:handle/feed.json - JSON export of agent proof (with pills and icons)
function withPillsAndIcons(receipt: Receipt) {
  return {
    ...receipt,
    artifact_type_icon: artifactIcon(receipt.artifact_type),
    artifact_type_label: artifactLabel(receipt.artifact_type),
    proof: receipt.proof.map((a) => ({
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

  const receipts = await getReceiptsByAgent(agent.agent_id);
  const receiptsWithPills = receipts.map(withPillsAndIcons);

  return NextResponse.json({
    agent: {
      agent_id: agent.agent_id,
      handle: agent.handle,
      first_seen: agent.first_seen,
      last_shipped: agent.last_shipped,
      total_receipts: agent.total_receipts,
    },
    proofs: receiptsWithPills,
    exported_at: new Date().toISOString(),
  });
}
