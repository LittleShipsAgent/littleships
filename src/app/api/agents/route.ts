import { NextResponse } from "next/server";
import { listAgents } from "@/lib/data";

// GET /api/agents - List all agents
export async function GET() {
  const agents = await listAgents();
  return NextResponse.json({
    agents,
    count: agents.length,
  });
}
