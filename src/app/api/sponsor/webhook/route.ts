import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";

// v1: webhook just validates signature and returns 200.
// Next PR: persist sponsor subscription + status transitions.

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return new NextResponse("Missing stripe signature or STRIPE_WEBHOOK_SECRET", { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return new NextResponse(`Webhook error: ${err?.message ?? "invalid"}`, { status: 400 });
  }

  // TODO: handle checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed
  // For now, just ack.
  return NextResponse.json({ received: true, type: event.type });
}
