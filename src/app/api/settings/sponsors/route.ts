import { NextResponse } from "next/server";
import { getSiteSettingBool } from "@/lib/db/settings";
import { getSiteSettingInt } from "@/lib/db/settings-int";

export async function GET() {
  const enabled = await getSiteSettingBool("sponsors_enabled", false);
  const slotsTotal = await getSiteSettingInt("sponsor_slots_total", 10);
  return NextResponse.json({ enabled, slotsTotal });
}
