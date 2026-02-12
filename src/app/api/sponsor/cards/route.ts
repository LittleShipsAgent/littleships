import { NextResponse } from "next/server";
import { getActiveSponsorCards } from "@/lib/db/sponsors";

export async function GET() {
  const cards = await getActiveSponsorCards(19);
  return NextResponse.json({ cards });
}
