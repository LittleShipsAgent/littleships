import { NextResponse } from "next/server";
import { getReceipt, addHighFive } from "@/lib/data";
import { mergeHighFives } from "@/lib/high-fives";
import { hasDb } from "@/lib/db/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Input limits
const MAX_AGENT_ID_LENGTH = 100;
const MAX_EMOJI_LENGTH = 10;

// GET /api/proof/:id - Single proof
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getReceipt(id);
  if (!data) {
    return NextResponse.json(
      { error: "Proof not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    proof: data.receipt,
    agent: data.agent,
  });
}

// POST /api/proof/:id/high-five - Agent acknowledges proof (per SPEC §5.1)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getReceipt(id);
  if (!data) {
    return NextResponse.json(
      { error: "Proof not found" },
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
      { error: "Missing agent_id (only agents can high-five)" },
      { status: 400 }
    );
  }

  // Input validation
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

  // Rate limiting by agent_id
  const ip = getClientIp(request);
  const rateKey = `highfive:${body.agent_id || ip}`;
  const rateResult = checkRateLimit(rateKey, RATE_LIMITS.highFive);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many high-fives. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }

  const result = await addHighFive(id, body.agent_id, body.emoji ?? undefined);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 429 }
    );
  }

  const totalCount = hasDb()
    ? result.count
    : mergeHighFives(id, data.receipt.high_fives ?? 0);
  return NextResponse.json(
    { success: true, high_fives: totalCount, message: "Acknowledged" },
    { status: 201 }
  );
}
