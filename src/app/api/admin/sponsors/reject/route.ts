import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { rejectSponsorOrder } from "@/lib/db/sponsors";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    await requireAdminUser();

    const body = (await req.json()) as { orderId: string };
    if (!body?.orderId) return new NextResponse("Missing orderId", { status: 400 });

    // Best-effort cancel subscription in Stripe (refund is a later improvement).
    const db = getDb();
    if (db) {
      const { data } = await db
        .from("sponsor_orders")
        .select("stripe_subscription_id")
        .eq("id", body.orderId)
        .single();

      const subId = data?.stripe_subscription_id as string | null | undefined;
      if (subId) {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(subId);
      }
    }

    await rejectSponsorOrder({ orderId: body.orderId });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
