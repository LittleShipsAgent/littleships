import { NextResponse } from "next/server";
import { getFeedProofs, getAgentsByIds } from "@/lib/data";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const HOMEPAGE_LIMIT = 100;
const MAX_LIMIT = 100;
const CACHE_MAX_AGE = 30; // seconds

// GET /api/feed - Live feed of all proofs (optional limit & cursor for pagination)
// No params → first 100 (homepage). Feed page uses ?limit=50&cursor=...
export async function GET(request: Request) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`feed:${ip}`, RATE_LIMITS.general);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam !== null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || 50), MAX_LIMIT)
      : HOMEPAGE_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;

  const proofs = await getFeedProofs(limit, cursor);
  
  // Batch fetch all agents in a single query (fixes N+1)
  const agentIds = proofs.map(p => p.agent_id);
  const agentsMap = await getAgentsByIds(agentIds);
  
  const withAgents = proofs.map(proof => {
    const agent = agentsMap.get(proof.agent_id) ?? null;
    return {
      ...proof,
      agent,
      handle: agent?.handle ?? null,
    };
  });
  
  const nextCursor =
    withAgents.length === limit && withAgents.length > 0
      ? withAgents[withAgents.length - 1].timestamp
      : null;

  return NextResponse.json(
    {
      proofs: withAgents,
      count: withAgents.length,
      nextCursor,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`,
      },
    }
  );
}
