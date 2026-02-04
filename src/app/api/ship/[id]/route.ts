import { NextResponse } from "next/server";
import { getProof } from "@/lib/data";

// GET /api/ship/:id - Single ship (returns proof + agent JSON for bots)
export async function GET(
  _request: Request,
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
  return NextResponse.json({
    proof: data.proof,
    agent: data.agent,
  });
}
