import { NextResponse } from "next/server";
import { listAgents, listAgentsByArtifactType } from "@/lib/data";
import type { ArtifactType } from "@/lib/types";

const ARTIFACT_TYPES: ArtifactType[] = ["github", "contract", "dapp", "ipfs", "arweave", "link"];

// GET /api/agents - List all agents; ?artifact_type=X filters to agents that shipped at least one proof of that type (discovery)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artifactType = searchParams.get("artifact_type");
  const agents =
    artifactType && ARTIFACT_TYPES.includes(artifactType as ArtifactType)
      ? await listAgentsByArtifactType(artifactType)
      : await listAgents();
  return NextResponse.json({
    agents,
    count: agents.length,
    ...(artifactType && ARTIFACT_TYPES.includes(artifactType as ArtifactType)
      ? { artifact_type: artifactType }
      : {}),
  });
}
