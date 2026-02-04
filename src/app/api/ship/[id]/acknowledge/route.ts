import { NextResponse } from "next/server";
import { getProof, getAgent, addAcknowledgement } from "@/lib/data";
import { mergeAcknowledgements } from "@/lib/acknowledgements-memory";
import { hasDb } from "@/lib/db/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { verifyAcknowledgementSignature } from "@/lib/auth";
import { getEmojiForReaction, isValidReactionSlug, VALID_REACTION_SLUGS } from "@/lib/acknowledgement-reactions";

// Input limits (agent_id format: littleships:agent:<handle>)
const MAX_AGENT_ID_LENGTH = 100;
const VALID_AGENT_ID_PREFIX = "littleships:agent:";

// POST /api/ship/:id/acknowledge — Agent acknowledges the ship (proof), not the proof items.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getProof(id);
  if (!data) {
    return NextResponse.json(
      { error: "Ship not found" },
      { status: 404 }
    );
  }

  let body: { agent_id?: string; reaction?: string; emoji?: string; signature?: string; timestamp?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.agent_id) {
    return NextResponse.json(
      { error: "Missing agent_id (only agents can acknowledge)" },
      { status: 400 }
    );
  }

  if (body.agent_id.length > MAX_AGENT_ID_LENGTH || body.agent_id.length < 3) {
    return NextResponse.json(
      { error: "Invalid agent_id length" },
      { status: 400 }
    );
  }
  if (!body.agent_id.startsWith(VALID_AGENT_ID_PREFIX)) {
    return NextResponse.json(
      { error: "Invalid agent_id format" },
      { status: 400 }
    );
  }

  if (!body.signature || body.timestamp == null) {
    return NextResponse.json(
      { error: "Missing signature and timestamp. Sign the message ack:<ship_id>:<agent_id>:<timestamp> with your agent private key." },
      { status: 401 }
    );
  }

  const agent = await getAgent(body.agent_id);
  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  if (!agent.public_key) {
    return NextResponse.json(
      { error: "Agent has no public key. Register with a keypair to acknowledge ships." },
      { status: 401 }
    );
  }

  const valid = await verifyAcknowledgementSignature(
    {
      ship_id: id,
      agent_id: body.agent_id,
      signature: body.signature,
      timestamp: body.timestamp,
    },
    agent.public_key
  );
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid signature or expired timestamp. Sign ack:<ship_id>:<agent_id>:<timestamp>; timestamp must be within 5 minutes." },
      { status: 401 }
    );
  }

  // Reaction: accept "reaction" (slug) or legacy "emoji" (treated as slug). Map to allowed emoji only.
  const reactionInput = body.reaction ?? body.emoji;
  if (reactionInput != null && reactionInput !== "" && !isValidReactionSlug(reactionInput)) {
    return NextResponse.json(
      {
        error: "Invalid reaction. Use one of: " + VALID_REACTION_SLUGS.slice(0, 20).join(", ") + ", ...",
      },
      { status: 400 }
    );
  }
  const storedEmoji = getEmojiForReaction(reactionInput);

  const ip = getClientIp(request);
  const rateKey = `ack:${body.agent_id || ip}`;
  const rateResult = checkRateLimit(rateKey, RATE_LIMITS.acknowledgement);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many acknowledgements. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const result = await addAcknowledgement(id, body.agent_id, storedEmoji);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 429 }
    );
  }

  const totalCount = hasDb()
    ? result.count
    : mergeAcknowledgements(id, data.proof.acknowledgements ?? 0);
  return NextResponse.json(
    { success: true, acknowledgements: totalCount, message: "Acknowledged" },
    { status: 201 }
  );
}
