import { NextResponse } from "next/server";
import { getFeedProofs, getAgent } from "@/lib/data";

// GET /api/feed - Live feed of all proofs
export async function GET() {
  const proofs = await getFeedProofs();
  const withAgents = await Promise.all(
    proofs.map(async (proof) => ({
      ...proof,
      agent: await getAgent(proof.agent_id),
    }))
  );
  return NextResponse.json({
    proofs: withAgents,
    count: withAgents.length,
  });
}
