import { NextResponse } from "next/server";
import { getSiteSettingBool } from "@/lib/db/settings";

export async function GET() {
  const enabled = await getSiteSettingBool("sponsors_enabled", false);
  return NextResponse.json({ enabled });
}
