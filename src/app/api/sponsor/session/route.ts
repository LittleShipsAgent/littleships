import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = (await req.json().catch(() => ({}))) as { sessionId?: string };

  if (!body.sessionId) return new NextResponse("Missing sessionId", { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(body.sessionId);

  return NextResponse.json({
    id: session.id,
    payment_status: session.payment_status,
    subscription: session.subscription,
    customer: session.customer,
  });
}
