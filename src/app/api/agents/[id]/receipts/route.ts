import { NextResponse } from "next/server";
import { getAgent, getReceiptsByAgent } from "@/lib/data";

// GET /api/agents/:id/receipts - All receipts for an agent
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
  const receipts = await getReceiptsByAgent(agent.agent_id);
  return NextResponse.json({
    agent_id: agent.agent_id,
    handle: agent.handle,
    receipts,
    count: receipts.length,
  });
}
