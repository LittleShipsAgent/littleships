import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getReturnBaseUrl } from "@/lib/urls";

// v1: dynamic price, single pool inventory.
// NOTE: slotsSold is stubbed until DB is added.
function getSlotsSold(): number {
  // TODO(DB): count active/approved/pending subscriptions.
  return 0;
}

function computePriceCents(slotsSold: number): number {
  const start = 59900;
  const step = 15000;
  const cap = 299900;
  return Math.min(start + slotsSold * step, cap);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = (await req.json().catch(() => ({}))) as { returnUrl?: string };

  const slotsSold = getSlotsSold();
  const priceCents = computePriceCents(slotsSold);

  // Create a monthly subscription Checkout Session with an ad-hoc price.
  // This keeps the pricing ladder server-authoritative.
  const returnBase = getReturnBaseUrl(body.returnUrl);

  const session = await stripe.checkout.sessions.create({
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
    // Keep the user on the same page: return to the page that initiated checkout.
    success_url: `${returnBase}?sponsorSuccess=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnBase}?sponsorCanceled=1`,
    allow_promotion_codes: false,
    metadata: {
      kind: "sponsor",
      slotsSoldAtPurchase: String(slotsSold),
      priceCentsAtPurchase: String(priceCents),
    },
  });

  return NextResponse.json({ url: session.url });
}
