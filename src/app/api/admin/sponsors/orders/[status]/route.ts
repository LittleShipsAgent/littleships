import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { listSponsorOrdersWithCreativeByStatus, type SponsorOrderStatus } from "@/lib/db/sponsors";

const ALLOWED: Array<Exclude<SponsorOrderStatus, "initiated">> = [
  "pending_approval",
  "active",
  "rejected",
  "canceled",
];

export async function GET(_req: Request, ctx: { params: Promise<{ status: string }> }) {
  try {
    await requireAdminUser();

    const { status } = await ctx.params;
    if (!ALLOWED.includes(status as any)) {
      return new NextResponse(`Invalid status: ${status}`, { status: 400 });
    }

    const orders = await listSponsorOrdersWithCreativeByStatus(status as any, 200);
    return NextResponse.json({ status, orders });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
