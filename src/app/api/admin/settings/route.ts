import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminGetSetting, adminUpsertSetting } from "@/lib/db/settings-admin";

const KEY_SPONSORS = "sponsors_enabled";

export async function GET() {
  try {
    const { supabase } = await requireAdminUser();
    const sponsors = (await adminGetSetting<{ enabled: boolean }>(supabase, KEY_SPONSORS)) ?? { enabled: false };
    return NextResponse.json({ sponsors });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase } = await requireAdminUser();
    const body = (await req.json().catch(() => ({}))) as any;

    if (body.sponsors?.enabled !== undefined) {
      await adminUpsertSetting(supabase, KEY_SPONSORS, { enabled: !!body.sponsors.enabled });
    }

    const sponsors = (await adminGetSetting<{ enabled: boolean }>(supabase, KEY_SPONSORS)) ?? { enabled: false };
    return NextResponse.json({ sponsors });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
