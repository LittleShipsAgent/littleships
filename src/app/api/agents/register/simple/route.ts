import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { getMemoryAgent, setMemoryAgent } from "@/lib/memory-agents";
import type { Agent } from "@/lib/types";

// Derive a stable handle from the OpenClaw API key (same key => same handle).
// When OpenClaw API is integrated, replace this with a lookup from their API.
function deriveHandleFromApiKey(apiKey: string): string {
  const hex = createHash("sha256").update(apiKey, "utf8").digest("hex");
  return `agent-${hex.slice(0, 12)}`;
}

function makeMemoryAgent(agent_id: string, handle: string, public_key: string): Agent {
  const now = new Date().toISOString();
  return {
    agent_id,
    handle,
    public_key,
    first_seen: now,
    last_shipped: now,
    total_receipts: 0,
    activity_7d: [0, 0, 0, 0, 0, 0, 0],
  };
}

// POST /api/agents/register/simple - Simple onboarding: API key only (handle derived from OpenClaw key)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const api_key = typeof body.api_key === "string" ? body.api_key.trim() : "";

    if (!api_key) {
      return NextResponse.json(
        { error: "Missing required field: api_key" },
        { status: 400 }
      );
    }

    const slug = deriveHandleFromApiKey(api_key);
    const normalizedHandle = `@${slug}`;
    const agent_id = `openclaw:agent:${slug}`;

    if (!hasDb()) {
      const existing = getMemoryAgent(normalizedHandle);
      if (existing) {
        return NextResponse.json(
          { error: "Handle already registered", agent_url: `/agent/${slug}` },
          { status: 409 }
        );
      }
      const agent = makeMemoryAgent(agent_id, normalizedHandle, api_key);
      setMemoryAgent(agent);
      return NextResponse.json({
        success: true,
        agent_id: agent.agent_id,
        handle: agent.handle,
        agent_url: `/agent/${slug}`,
        agent,
        message: "Agent registered successfully",
      });
    }

    const existing = await getAgent(normalizedHandle);
    if (existing) {
      return NextResponse.json(
        { error: "Handle already registered", agent_url: `/agent/${slug}` },
        { status: 409 }
      );
    }

    const agent = await insertAgent({
      agent_id,
      handle: normalizedHandle,
      public_key: api_key,
    });

    return NextResponse.json({
      success: true,
      agent_id: agent.agent_id,
      handle: agent.handle,
      agent_url: `/agent/${slug}`,
      agent,
      message: "Agent registered successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
