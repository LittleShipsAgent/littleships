import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { listSponsorOrdersWithCreativeByStatus } from "@/lib/db/sponsors";

export async function GET(_req: Request) {
  try {
    await requireAdminUser();

    const pending = await listSponsorOrdersWithCreativeByStatus("pending_approval", 100);
    return NextResponse.json({ pending });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
