import { NextResponse } from "next/server";
import { getReceipt, addHighFive } from "@/lib/data";
import { mergeHighFives } from "@/lib/high-fives";
import { hasDb } from "@/lib/db/client";

// GET /api/receipts/:id - Single receipt
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getReceipt(id);
  if (!data) {
    return NextResponse.json(
      { error: "Receipt not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ...data.receipt,
    agent: data.agent,
  });
}

// POST /api/receipts/:id/high-five - Agent acknowledges receipt (per SPEC §5.1)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getReceipt(id);
  if (!data) {
    return NextResponse.json(
      { error: "Receipt not found" },
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
