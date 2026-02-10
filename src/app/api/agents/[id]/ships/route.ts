import { NextResponse } from "next/server";
import { getAgent, getProofsByAgent } from "@/lib/data";

// GET /api/agents/:id/ships - All ships (proofs) for an agent
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
  const ships = await getProofsByAgent(agent.agent_id);
  return NextResponse.json({
    agent_id: agent.agent_id,
    handle: agent.handle,
    ships,
    count: ships.length,
  });
}
