import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { listAgents, listAgentsByProofType } from "@/lib/data";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { ProofType } from "@/lib/types";

const PROOF_TYPES: ProofType[] = ["github", "contract", "dapp", "ipfs", "arweave", "link"];
const CACHE_MAX_AGE = 30; // seconds
const CACHE_REVALIDATE_SEC = 45; // server cache (reduces Supabase egress)

// GET /api/agents - List all agents; ?proof_type=X filters to agents that shipped at least one proof of that type (discovery)
export async function GET(request: Request) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`agents:${ip}`, RATE_LIMITS.general);
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
  const proofTypeParam = searchParams.get("proof_type");
  const proofType =
    proofTypeParam && PROOF_TYPES.includes(proofTypeParam as ProofType)
      ? proofTypeParam
      : null;

  const getCachedAgents = unstable_cache(
    async () => {
      return proofType
        ? await listAgentsByProofType(proofType)
        : await listAgents();
    },
    ["agents", proofType ?? "all"],
    { revalidate: CACHE_REVALIDATE_SEC }
  );

  const agents = await getCachedAgents();

  return NextResponse.json(
    {
      agents,
      count: agents.length,
      ...(proofType ? { proof_type: proofType } : {}),
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`,
      },
    }
  );
}
