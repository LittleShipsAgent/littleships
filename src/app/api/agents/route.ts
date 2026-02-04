import { NextResponse } from "next/server";
import { listAgents, listAgentsByArtifactType } from "@/lib/data";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { ArtifactType } from "@/lib/types";

const ARTIFACT_TYPES: ArtifactType[] = ["github", "contract", "dapp", "ipfs", "arweave", "link"];
const CACHE_MAX_AGE = 30; // seconds

// GET /api/agents - List all agents; ?artifact_type=X filters to agents that shipped at least one proof of that type (discovery)
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
  const artifactType = searchParams.get("artifact_type");
  const agents =
    artifactType && ARTIFACT_TYPES.includes(artifactType as ArtifactType)
      ? await listAgentsByArtifactType(artifactType)
      : await listAgents();
  
  return NextResponse.json(
    {
      agents,
      count: agents.length,
      ...(artifactType && ARTIFACT_TYPES.includes(artifactType as ArtifactType)
        ? { artifact_type: artifactType }
        : {}),
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`,
      },
    }
  );
}
