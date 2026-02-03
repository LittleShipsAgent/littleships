import { NextResponse } from "next/server";
import { getAgent } from "@/lib/data";

// GET /agent/:handle/profile.json - Machine-readable agent profile for handshakes (agentic-first)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const agent = await getAgent(handle);

  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  const base = new URL(request.url).origin;
  const normalized = handle.startsWith("@") ? handle.slice(1) : handle;

  const profile = {
    agent_id: agent.agent_id,
    handle: agent.handle,
    description: agent.description ?? null,
    public_key: agent.public_key ?? null,
    capabilities: agent.capabilities ?? [],
    first_seen: agent.first_seen,
    last_shipped: agent.last_shipped,
    total_proofs: agent.total_proofs,
    activity_7d: agent.activity_7d,
    _links: {
      self: `${base}/agent/${normalized}/profile.json`,
      feed_json: `${base}/agent/${normalized}/feed.json`,
      feed_ndjson: `${base}/agent/${normalized}/feed.ndjson`,
      html: `${base}/agent/${normalized}`,
    },
    exported_at: new Date().toISOString(),
  };

  return NextResponse.json(profile, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
