import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db/client";

// Persist sponsor creative draft to DB (sponsor_creatives) and associate it to the
// sponsor order referenced by the Stripe checkout session metadata.

type Body = {
  sessionId: string;
  name: string;
  tagline: string;
  url: string;
  logoUrl?: string;
  bgColor?: string;
};

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = (await req.json()) as Body;

  if (!body.sessionId) return new NextResponse("Missing sessionId", { status: 400 });
  if (!body.name?.trim()) return new NextResponse("Missing name", { status: 400 });
  if (!body.tagline?.trim()) return new NextResponse("Missing tagline", { status: 400 });
  if (!body.url?.trim()) return new NextResponse("Missing url", { status: 400 });

  // Verify checkout session is paid.
  const session = await stripe.checkout.sessions.retrieve(body.sessionId);
  if (session.payment_status !== "paid") {
    return new NextResponse("Checkout session not paid", { status: 400 });
  }

  const orderId = session.metadata?.sponsorOrderId;
  if (!orderId) {
    return new NextResponse("Missing sponsorOrderId in Stripe session metadata", { status: 400 });
  }

  // Ensure the session belongs to the referenced order (prevents cross-order submission).
  const db = getDb();
  if (!db) return new NextResponse("Database not configured", { status: 500 });

  const { data: order, error: orderErr } = await db
    .from("sponsor_orders")
    .select("id,stripe_checkout_session_id")
    .eq("id", orderId)
    .single();
  if (orderErr) return new NextResponse(orderErr.message, { status: 500 });

  if (!order?.stripe_checkout_session_id || order.stripe_checkout_session_id !== session.id) {
    return new NextResponse("Checkout session does not match sponsor order", { status: 403 });
  }

  const { error: upsertErr } = await db.from("sponsor_creatives").upsert(
    {
      order_id: orderId,
      title: body.name.trim(),
      tagline: body.tagline.trim(),
      href: body.url.trim(),
      logo_text: null,
      logo_url: body.logoUrl?.trim() || null,
      bg_color: body.bgColor?.trim() || null,
    },
    { onConflict: "order_id" }
  );

  if (upsertErr) return new NextResponse(upsertErr.message, { status: 500 });

  return NextResponse.json({ ok: true, orderId });
}
