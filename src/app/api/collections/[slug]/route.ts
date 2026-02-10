import { NextResponse } from "next/server";
import { getCollectionBySlug } from "@/lib/collections";
import { getFeedProofs } from "@/lib/data";

// GET /api/collections/:slug - public collection definition + ships that submitted into it
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);
  if (!col) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  // For MVP: fetch recent feed and filter in-memory. Later: DB query by collections contains.
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "200", 10), 1), 500);

  const proofs = await getFeedProofs(limit);
  const ships = proofs.filter((p) => Array.isArray(p.collections) && p.collections.includes(col.slug));

  return NextResponse.json({
    collection: col,
    ships,
    count: ships.length,
  });
}
