import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Create an Embedded Checkout session (no redirect to stripe.com).
// Client uses the returned client_secret with <EmbeddedCheckoutProvider />.

// NOTE: slotsSold is stubbed until DB is added.
function getSlotsSold(): number {
  return 0;
}

function computePriceCents(slotsSold: number): number {
  const start = 59900;
  const step = 15000; // $150
  const cap = 299900;
  return Math.min(start + slotsSold * step, cap);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = (await req.json().catch(() => ({}))) as { returnUrl?: string };

  const slotsSold = getSlotsSold();
  const priceCents = computePriceCents(slotsSold);

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
      slotsSoldAtPurchase: String(slotsSold),
      priceCentsAtPurchase: String(priceCents),
    },
  });

  return NextResponse.json({
    sessionId: session.id,
    clientSecret: session.client_secret,
  });
}
