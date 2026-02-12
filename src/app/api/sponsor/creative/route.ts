import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// v1: store creative in memory (no DB yet). This unblocks the UX.
// Next PR: persist to Supabase and mark pending_approval.

type Body = {
  sessionId: string;
  name: string;
  tagline: string;
  url: string;
  logoUrl?: string;
  bgColor?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = globalThis;
if (!globalAny.__sponsorCreatives) globalAny.__sponsorCreatives = new Map<string, Body>();

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

  globalAny.__sponsorCreatives.set(body.sessionId, {
    sessionId: body.sessionId,
    name: body.name.trim(),
    tagline: body.tagline.trim(),
    url: body.url.trim(),
    logoUrl: body.logoUrl?.trim() || undefined,
    bgColor: body.bgColor?.trim() || undefined,
  });

  return NextResponse.json({ ok: true });
}
