import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getSiteSettingInt } from "@/lib/db/settings-int";
import { getDb } from "@/lib/db/client";
import { getSlotsSold } from "@/lib/db/sponsors";
import { computeSponsorPriceCents } from "@/lib/sponsors/pricing";

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export async function GET() {
  try {
    await requireAdminUser();

    const slotsTotal = await getSiteSettingInt("sponsor_slots_total", 10);
    const slotsSold = await getSlotsSold();
    const slotsAvailable = Math.max(0, slotsTotal - slotsSold);

    const nextPriceCents = computeSponsorPriceCents(slotsSold);

    // Revenue collected: count any paid slot that is in-flight or live.
    // (initiated doesn't count)
    const db = getDb();
    if (!db) return new NextResponse("Database not configured", { status: 500 });

    const { data: rows, error } = await db
      .from("sponsor_orders")
      .select("price_cents,status")
      .in("status", ["pending_approval", "active"])
      .limit(500);
    if (error) throw error;

    const collectedCents = (rows ?? []).reduce((sum: number, r: any) => sum + (Number(r.price_cents) || 0), 0);

    // Potential remaining MRR if the remaining inventory sold at the current ladder.
    let remainingPotentialCents = 0;
    for (let i = 0; i < slotsAvailable; i++) {
      remainingPotentialCents += computeSponsorPriceCents(slotsSold + i);
    }

    const totalPotentialCents = collectedCents + remainingPotentialCents;

    return NextResponse.json({
      slotsTotal,
      slotsSold,
      slotsAvailable,
      nextPriceCents,
      collectedCents,
      remainingPotentialCents,
      totalPotentialCents,
      _display: {
        nextPrice: fmtUsd(nextPriceCents),
        collected: fmtUsd(collectedCents),
        remainingPotential: fmtUsd(remainingPotentialCents),
        totalPotential: fmtUsd(totalPotentialCents),
      },
    });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
