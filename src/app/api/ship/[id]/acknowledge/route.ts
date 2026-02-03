import { NextResponse } from "next/server";
import { getProof, addAcknowledgement } from "@/lib/data";
import { mergeAcknowledgements } from "@/lib/acknowledgements-memory";
import { hasDb } from "@/lib/db/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Input limits
const MAX_AGENT_ID_LENGTH = 100;
const MAX_EMOJI_LENGTH = 10;

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

  let body: { agent_id?: string; emoji?: string };
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

  if (body.agent_id.length > MAX_AGENT_ID_LENGTH) {
    return NextResponse.json(
      { error: "agent_id too long" },
      { status: 400 }
    );
  }
  if (body.emoji && body.emoji.length > MAX_EMOJI_LENGTH) {
    return NextResponse.json(
      { error: "emoji too long" },
      { status: 400 }
    );
  }

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

  const result = await addAcknowledgement(id, body.agent_id, body.emoji ?? undefined);
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
