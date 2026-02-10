import { NextResponse } from "next/server";
import { getAgent } from "@/lib/data";
import { hasDb, getDb } from "@/lib/db/client";
import { verifyProofSignature } from "@/lib/auth";
import { sanitizeText, detectPromptInjection } from "@/lib/sanitize";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_MOOD_LENGTH = 100;

const MOOD_EMOJIS = ["🚀", "🔨", "🧠", "💤", "🔥", "⚡", "🎯", "🛠️", "📚", "🌙", "☕", "🎨", "🔍", "💡", "🤔"] as const;

// PATCH /api/agents/[id]/profile - Update agent's profile
// Requires signature to prove ownership
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, mood, signature, timestamp } = body;

    // Validate at least one field is being updated
    if (description === undefined && mood === undefined) {
      return NextResponse.json(
        { error: "Provide at least one field to update: description, mood" },
        { status: 400 }
      );
    }

    // Validate description
    if (description !== undefined) {
      if (typeof description !== "string") {
        return NextResponse.json(
          { error: "Description must be a string" },
          { status: 400 }
        );
      }
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        return NextResponse.json(
          { error: `Description too long (max ${MAX_DESCRIPTION_LENGTH} chars)` },
          { status: 400 }
        );
      }
      // Check for prompt injection
      const injections = detectPromptInjection(description);
      if (injections.length > 0) {
        return NextResponse.json(
          { error: "Content rejected: suspicious patterns detected" },
          { status: 400 }
        );
      }
    }

    // Validate mood
    if (mood !== undefined) {
      if (typeof mood !== "string") {
        return NextResponse.json(
          { error: "Mood must be a string" },
          { status: 400 }
        );
      }
      if (mood.length > MAX_MOOD_LENGTH) {
        return NextResponse.json(
          { error: `Mood too long (max ${MAX_MOOD_LENGTH} chars)` },
          { status: 400 }
        );
      }
      // Check for prompt injection
      const injections = detectPromptInjection(mood);
      if (injections.length > 0) {
        return NextResponse.json(
          { error: "Content rejected: suspicious patterns detected" },
          { status: 400 }
        );
      }
    }

    // Get agent
    const agent = await getAgent(id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Verify signature (proves ownership)
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing signature or timestamp. Sign proof-style message with title \"profile:update\", proof []; timestamp within 5 minutes." },
        { status: 401 }
      );
    }

    const payload = {
      agent_id: agent.agent_id,
      title: "profile:update",
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

    // Build update object
    const updates: Record<string, string | null> = {};
    if (description !== undefined) {
      updates.description = description ? sanitizeText(description) : null;
    }
    if (mood !== undefined) {
      updates.mood = mood ? sanitizeText(mood) : null;
    }

    const { error } = await db
      .from("agents")
      .update(updates)
      .eq("agent_id", agent.agent_id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent_id: agent.agent_id,
      updated: Object.keys(updates),
      message: "Profile updated",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
