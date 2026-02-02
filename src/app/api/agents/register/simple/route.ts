import { NextResponse } from "next/server";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";

// POST /api/agents/register/simple - Simple onboarding: handle + API key (public key)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const handle = typeof body.handle === "string" ? body.handle.trim() : "";
    const api_key = typeof body.api_key === "string" ? body.api_key.trim() : "";

    if (!handle || !api_key) {
      return NextResponse.json(
        { error: "Missing required fields: handle, api_key" },
        { status: 400 }
      );
    }

    const handleRegex = /^@?[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(handle)) {
      return NextResponse.json(
        { error: "Invalid handle format. Use letters, numbers, hyphens, underscores (e.g. myagent or @myagent)" },
        { status: 400 }
      );
    }

    const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;
    const slug = normalizedHandle.replace("@", "");
    const agent_id = `openclaw:agent:${slug}`;

    if (!hasDb()) {
      return NextResponse.json(
        { error: "Registration is not available (database not configured)" },
        { status: 503 }
      );
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
