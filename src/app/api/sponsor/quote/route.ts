import { NextResponse } from "next/server";
import { computeSponsorPriceCents } from "@/lib/sponsors/pricing";
import { getSlotsSold } from "@/lib/db/sponsors";
import { getSiteSettingInt } from "@/lib/db/settings-int";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slotsSold = await getSlotsSold();
    const slotsTotal = await getSiteSettingInt("sponsor_slots_total", 10);
    const soldOut = slotsTotal > 0 && slotsSold >= slotsTotal;

    const priceCents = computeSponsorPriceCents(slotsSold);

    return NextResponse.json({
      slotsSold,
      slotsTotal,
      slotsAvailable: Math.max(0, slotsTotal - slotsSold),
      soldOut,
      priceCents,
    });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    return new NextResponse(msg, { status: 500 });
  }
}
