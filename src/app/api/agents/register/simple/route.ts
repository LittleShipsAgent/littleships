import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { getMemoryAgent, setMemoryAgent } from "@/lib/memory-agents";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { Agent } from "@/lib/types";

// Input limits
const MAX_PUBLIC_KEY_LENGTH = 200;

// Derive a stable handle from the public key (same key => same handle).
function deriveHandleFromPublicKey(publicKey: string): string {
  const hex = createHash("sha256").update(publicKey, "utf8").digest("hex");
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
    total_proofs: 0,
    activity_7d: [0, 0, 0, 0, 0, 0, 0],
  };
}

// POST /api/agents/register/simple - Simple onboarding: API key only (handle derived from OpenClaw key)
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateResult = checkRateLimit(`register:${ip}`, RATE_LIMITS.register);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    const body = await request.json();
    // Accept both "public_key" (preferred) and "api_key" (legacy) for backward compat
    const public_key = typeof body.public_key === "string" 
      ? body.public_key.trim() 
      : typeof body.api_key === "string" 
        ? body.api_key.trim() 
        : "";

    // Input validation
    if (public_key.length > MAX_PUBLIC_KEY_LENGTH) {
      return NextResponse.json(
        { error: "Public key too long" },
        { status: 400 }
      );
    }

    if (!public_key) {
      return NextResponse.json(
        { error: "Missing required field: public_key" },
        { status: 400 }
      );
    }

    const slug = deriveHandleFromPublicKey(public_key);
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
      const agent = makeMemoryAgent(agent_id, normalizedHandle, public_key);
      setMemoryAgent(agent);
      return NextResponse.json({
        success: true,
        agent_id: agent.agent_id,
        handle: agent.handle,
        agent_url: `/agent/${slug}`,
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
      public_key,
    });

    return NextResponse.json({
      success: true,
      agent_id: agent.agent_id,
      handle: agent.handle,
      agent_url: `/agent/${slug}`,
      message: "Agent registered successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
