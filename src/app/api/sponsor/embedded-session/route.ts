import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { computeSponsorPriceCents } from "@/lib/sponsors/pricing";
import { attachStripeSessionToOrder, createSponsorOrder, getSlotsSold } from "@/lib/db/sponsors";

// Create an Embedded Checkout session (no redirect to stripe.com).
// Client uses the returned client_secret with <EmbeddedCheckoutProvider />.

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = (await req.json().catch(() => ({}))) as { returnUrl?: string };

  const slotsSold = await getSlotsSold();
  const priceCents = computeSponsorPriceCents(slotsSold);

  // Create DB order first, so the Stripe session can reference it.
  const order = await createSponsorOrder({ priceCents, slotsSoldAtPurchase: slotsSold });

  // returnUrl intentionally ignored for embedded Checkout sessions with redirect_on_completion: "never".

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          product_data: {
            name: "LittleShips Sponsor Spot",
            description: "Monthly sponsorship slot on LittleShips (pending approval)",
          },
          unit_amount: priceCents,
        },
      },
    ],
    // return_url not allowed for embedded Checkout when redirect_on_completion is "never"
    metadata: {
      kind: "sponsor",
      sponsorOrderId: order.id,
      slotsSoldAtPurchase: String(slotsSold),
      priceCentsAtPurchase: String(priceCents),
    },
  });

  // Link Stripe session -> order
  await attachStripeSessionToOrder({
    orderId: order.id,
    stripeCheckoutSessionId: session.id,
    purchaserEmail: session.customer_details?.email ?? null,
  });

  return NextResponse.json({
    orderId: order.id,
    sessionId: session.id,
    clientSecret: session.client_secret,
  });
}
