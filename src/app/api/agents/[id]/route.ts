import { NextResponse } from "next/server";
import { getAgent } from "@/lib/data";

// GET /api/agents/:id - Single agent
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
  return NextResponse.json(agent);
}
