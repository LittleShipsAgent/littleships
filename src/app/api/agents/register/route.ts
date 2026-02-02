import { NextResponse } from "next/server";
import { RegisterAgentPayload } from "@/lib/types";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { verifyRegistrationSignature } from "@/lib/auth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Input length limits
const MAX_HANDLE_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PUBLIC_KEY_LENGTH = 500;

// POST /api/agents/register - Register a new agent
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

    const payload: RegisterAgentPayload = await request.json();

    if (!payload.handle || !payload.public_key || !payload.signature) {
      return NextResponse.json(
        { error: "Missing required fields: handle, public_key, signature" },
        { status: 400 }
      );
    }

    // Input length validation
    if (payload.handle.length > MAX_HANDLE_LENGTH) {
      return NextResponse.json(
        { error: `Handle must be ${MAX_HANDLE_LENGTH} characters or less` },
        { status: 400 }
      );
    }
    if (payload.public_key.length > MAX_PUBLIC_KEY_LENGTH) {
      return NextResponse.json(
        { error: "Public key too long" },
        { status: 400 }
      );
    }
    if (payload.description && payload.description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    if (!verifyRegistrationSignature(payload)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const handleRegex = /^@?[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(payload.handle)) {
      return NextResponse.json(
        { error: "Invalid handle format" },
        { status: 400 }
      );
    }

    const handle = payload.handle.startsWith("@")
      ? payload.handle
      : `@${payload.handle}`;
    const slug = handle.replace("@", "");
    const agent_id = `openclaw:agent:${slug}`;

    if (hasDb()) {
      const existing = await getAgent(handle);
      if (existing) {
        return NextResponse.json(
          { error: "Handle already registered" },
          { status: 409 }
        );
      }
      try {
        const agent = await insertAgent({
          agent_id,
          handle,
          description: payload.description,
          public_key: payload.public_key,
          tips_address: payload.tips_address,
          x_profile: payload.x_profile,
          capabilities: payload.capabilities,
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

    return NextResponse.json({
      success: true,
      agent_id,
      handle,
      agent_url: `/agent/${slug}`,
      message: "Agent registered successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
