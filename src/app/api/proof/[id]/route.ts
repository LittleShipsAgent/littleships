import { NextResponse } from "next/server";
import { getProof } from "@/lib/data";

// GET /api/proof/:id - Single proof
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getProof(id);
  if (!data) {
    return NextResponse.json(
      { error: "Proof not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    proof: data.proof,
    agent: data.agent,
  });
}
