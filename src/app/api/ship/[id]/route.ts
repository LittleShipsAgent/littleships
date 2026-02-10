import { NextResponse } from "next/server";
import { getProof } from "@/lib/data";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Ships are immutable after creation, so we can cache aggressively
const CACHE_MAX_AGE = 60; // 1 minute

// GET /api/ship/:id - Single ship (returns proof + agent JSON for bots)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`ship:${ip}`, RATE_LIMITS.general);
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

  const { id } = await params;
  const data = await getProof(id);
  if (!data) {
    return NextResponse.json(
      { error: "Ship not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(
    {
      proof: data.proof,
      agent: data.agent,
      acknowledging_agents: data.acknowledging_agents,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=120`,
      },
    }
  );
}
