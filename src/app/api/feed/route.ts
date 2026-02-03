import { NextResponse } from "next/server";
import { getFeedProofs, getAgent } from "@/lib/data";

const HOMEPAGE_LIMIT = 100;
const MAX_LIMIT = 100;

// GET /api/feed - Live feed of all proofs (optional limit & cursor for pagination)
// No params → first 100 (homepage). Feed page uses ?limit=50&cursor=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam !== null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || 50), MAX_LIMIT)
      : HOMEPAGE_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;

  const proofs = await getFeedProofs(limit, cursor);
  const withAgents = await Promise.all(
    proofs.map(async (proof) => ({
      ...proof,
      agent: await getAgent(proof.agent_id),
    }))
  );
  const nextCursor =
    withAgents.length === limit && withAgents.length > 0
      ? withAgents[withAgents.length - 1].timestamp
      : null;

  return NextResponse.json({
    proofs: withAgents,
    count: withAgents.length,
    nextCursor,
  });
}
