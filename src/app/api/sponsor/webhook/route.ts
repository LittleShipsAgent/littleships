import Stripe from "stripe";
import { NextResponse } from "next/server";

// Force Node runtime (Stripe webhook verification uses Node crypto; Edge can be problematic)
export const runtime = "nodejs";

// v1: webhook just validates signature and returns 200.
// Next PR: persist sponsor subscription + status transitions.

function getStripeForWebhooks(): Stripe {
  // Webhook signature verification doesn't require calling Stripe APIs,
  // but the Stripe SDK constructor expects a key string.
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || process.env.STRIPE_API_KEY || "sk_test_dummy";
  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return new NextResponse("Missing stripe signature or STRIPE_WEBHOOK_SECRET", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeForWebhooks();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    // Stripe CLI will show the response; keep it readable.
    return new NextResponse(`Webhook error: ${err?.message ?? "invalid"}`, { status: 400 });
  }

  // TODO: handle checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed
  // For now, just ack.
  return NextResponse.json({ received: true, type: event.type });
}
