import { NextResponse } from "next/server";
import { getSiteSettingInt } from "@/lib/db/settings-int";

const MIN = 5;
const MAX = 100;
const DEFAULT = 20;

export async function GET() {
  const raw = await getSiteSettingInt("feed_home_limit", DEFAULT);
  const limit = Math.max(MIN, Math.min(MAX, Math.floor(raw)));
  return NextResponse.json({ limit: Number.isFinite(limit) ? limit : DEFAULT });
}
