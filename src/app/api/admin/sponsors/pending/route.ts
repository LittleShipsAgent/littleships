import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin";
import { listPendingSponsorOrders } from "@/lib/db/sponsors";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("x-admin-token") ?? new URL(req.url).searchParams.get("token");
    requireAdminToken(token);

    const pending = await listPendingSponsorOrders(100);
    return NextResponse.json({ pending });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}
