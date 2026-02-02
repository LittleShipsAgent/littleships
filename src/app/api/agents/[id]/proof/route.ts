import { NextResponse } from "next/server";
import { getAgent, getReceiptsByAgent } from "@/lib/data";

// GET /api/agents/:id/proof - All proofs for an agent
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }
  const proofs = await getReceiptsByAgent(agent.agent_id);
  return NextResponse.json({
    agent_id: agent.agent_id,
    handle: agent.handle,
    proofs,
    count: proofs.length,
  });
}
