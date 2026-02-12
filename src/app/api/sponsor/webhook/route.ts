import Stripe from "stripe";
import { NextResponse } from "next/server";
import { markOrderCanceledBySubscription, markOrderPendingApproval } from "@/lib/db/sponsors";

// Force Node runtime (Stripe webhook verification uses Node crypto; Edge can be problematic)
export const runtime = "nodejs";

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
    return new NextResponse(`Webhook error: ${err?.message ?? "invalid"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.sponsorOrderId;
        if (!orderId) break;

        await markOrderPendingApproval({
          orderId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id,
          purchaserEmail: session.customer_details?.email ?? null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.id) {
          await markOrderCanceledBySubscription({ stripeSubscriptionId: sub.id });
        }
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    return new NextResponse(`Webhook handler error: ${err?.message ?? "error"}`, { status: 500 });
  }

  return NextResponse.json({ received: true, type: event.type });
}
