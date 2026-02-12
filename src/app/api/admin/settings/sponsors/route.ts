import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { setSiteSettingBool } from "@/lib/db/settings";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = (await req.json().catch(() => ({}))) as { enabled?: boolean };
    if (typeof body.enabled !== "boolean") return new NextResponse("Missing enabled", { status: 400 });

    await setSiteSettingBool("sponsors_enabled", body.enabled);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
