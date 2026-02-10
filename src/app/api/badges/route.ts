import { NextResponse } from "next/server";
import { BADGE_CATALOG, TIER_LABELS } from "@/lib/badges";

/** GET /api/badges — Badge catalog for agents (id, label, description, tier, howToEarn). Order = catalog index for bitmap decoding. */
export async function GET() {
  const badges = BADGE_CATALOG.map((b, index) => ({
    index,
    id: b.id,
    label: b.label,
    description: b.description,
    tier: b.tier,
    tier_label: TIER_LABELS[b.tier as keyof typeof TIER_LABELS],
    howToEarn: b.howToEarn ?? undefined,
  }));
  const tierOrder = [1, 2, 3, 4, 5, 6, 7] as const;
  const sections = tierOrder.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    badges: badges.filter((b) => b.tier === tier),
  }));
  return NextResponse.json({
    badges,
    count: badges.length,
    tier_labels: TIER_LABELS,
    sections,
  });
}
