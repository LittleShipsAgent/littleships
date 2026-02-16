import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { setSiteSettingInt } from "@/lib/db/settings-int";

const MIN = 5;
const MAX = 100;

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = (await req.json().catch(() => ({}))) as { limit?: number };
    const raw = typeof body.limit === "number" ? body.limit : NaN;
    const limit = Math.floor(raw);
    if (!Number.isFinite(limit) || limit < MIN || limit > MAX) {
      return NextResponse.json(
        { error: `limit must be between ${MIN} and ${MAX}` },
        { status: 400 }
      );
    }
    await setSiteSettingInt("feed_home_limit", limit);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
