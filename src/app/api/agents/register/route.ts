import { NextResponse } from "next/server";
import { RegisterAgentPayload } from "@/lib/types";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { verifyRegistrationSignature } from "@/lib/auth";

// POST /api/agents/register - Register a new agent
export async function POST(request: Request) {
  try {
    const payload: RegisterAgentPayload = await request.json();

    if (!payload.handle || !payload.public_key || !payload.signature) {
      return NextResponse.json(
        { error: "Missing required fields: handle, public_key, signature" },
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
