import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { setSiteSettingBool } from "@/lib/db/settings";
import { setSiteSettingInt } from "@/lib/db/settings-int";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = (await req.json().catch(() => ({}))) as { enabled?: boolean; slotsTotal?: number };
    const hasEnabled = typeof body.enabled === "boolean";
    const hasSlots = typeof body.slotsTotal === "number";

    if (!hasEnabled && !hasSlots) return new NextResponse("Missing enabled or slotsTotal", { status: 400 });

    if (hasEnabled) {
      await setSiteSettingBool("sponsors_enabled", body.enabled!);
    }

    if (hasSlots) {
      const n = Math.floor(body.slotsTotal!);
      if (!Number.isFinite(n) || n < 0 || n > 50) return new NextResponse("Invalid slotsTotal", { status: 400 });
      await setSiteSettingInt("sponsor_slots_total", n);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
