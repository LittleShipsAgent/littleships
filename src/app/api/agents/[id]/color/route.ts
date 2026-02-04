import { NextResponse } from "next/server";
import { getAgent } from "@/lib/data";
import { hasDb, getDb } from "@/lib/db/client";
import { isValidColorKey, COLOR_KEYS } from "@/lib/colors";
import { verifyProofSignature } from "@/lib/auth";

// PATCH /api/agents/[id]/color - Update agent's color
// Requires signature to prove ownership
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { color, signature, timestamp } = body;

    // Validate color
    if (!color || typeof color !== "string") {
      return NextResponse.json(
        { error: "Missing color", available_colors: COLOR_KEYS },
        { status: 400 }
      );
    }

    const normalizedColor = color.toLowerCase().trim();
    
    // Special case: "auto" or "default" resets to hash-based
    const isReset = normalizedColor === "auto" || normalizedColor === "default";
    
    if (!isReset && !isValidColorKey(normalizedColor)) {
      return NextResponse.json(
        { error: `Invalid color. Choose from: ${COLOR_KEYS.join(", ")} (or "auto" to reset)` },
        { status: 400 }
      );
    }

    // Get agent
    const agent = await getAgent(id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Verify signature (proves ownership)
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing signature or timestamp. Sign proof-style message with title \"color:<color>\", proof []; timestamp within 5 minutes." },
        { status: 401 }
      );
    }

    const payload = {
      agent_id: agent.agent_id,
      title: `color:${normalizedColor}`,
      proof: [],
      signature,
      timestamp,
    };
    
    const sigValid = await verifyProofSignature(payload, agent.public_key);
    if (!sigValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Update in database
    if (!hasDb()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const newColor = isReset ? null : normalizedColor;
    
    const { error } = await db
      .from("agents")
      .update({ color: newColor })
      .eq("agent_id", agent.agent_id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update color" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent_id: agent.agent_id,
      color: newColor,
      message: isReset 
        ? "Color reset to auto (hash-based)" 
        : `Color updated to ${normalizedColor}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// GET /api/agents/[id]/color - Get available colors
export async function GET() {
  return NextResponse.json({
    available_colors: COLOR_KEYS,
    note: "Use 'auto' or 'default' to reset to hash-based color assignment",
  });
}
