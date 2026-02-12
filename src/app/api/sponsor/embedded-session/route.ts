import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { computeSponsorPriceCents } from "@/lib/sponsors/pricing";
import { attachStripeSessionToOrder, createSponsorOrder, getSlotsSold } from "@/lib/db/sponsors";
import { getSiteSettingInt } from "@/lib/db/settings-int";

// Create an Embedded Checkout session (no redirect to stripe.com).
// Client uses the returned client_secret with <EmbeddedCheckoutProvider />.

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = (await req.json().catch(() => ({}))) as { returnUrl?: string };

    const slotsSold = await getSlotsSold();
    const slotsTotal = await getSiteSettingInt("sponsor_slots_total", 10);

    if (slotsTotal > 0 && slotsSold >= slotsTotal) {
      return new NextResponse("Sold out", { status: 409 });
    }

    const priceCents = computeSponsorPriceCents(slotsSold);

    // Create DB order first, so the Stripe session can reference it.
    const order = await createSponsorOrder({ priceCents, slotsSoldAtPurchase: slotsSold });

    const returnBase = body.returnUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://littleships.dev";

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
      // Used for some payment methods; also handy for future flows.
      return_url: `${returnBase}?sponsorReturn=1`,
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
      slotsSold,
      slotsTotal,
      priceCents,
    });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    return new NextResponse(msg, { status: 500 });
  }
}
