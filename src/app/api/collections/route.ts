import { NextResponse } from "next/server";
import { listCollections } from "@/lib/collections";

// GET /api/collections - list all collections
export async function GET() {
  const collections = await listCollections();
  return NextResponse.json({
    collections,
    count: collections.length,
  });
}
