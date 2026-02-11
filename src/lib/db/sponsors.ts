import "server-only";

import { getDb } from "./client";

export type SponsorOrderStatus =
  | "initiated"
  | "pending_approval"
  | "active"
  | "rejected"
  | "canceled";

export type SponsorCardRow = {
  order_id: string;
  creative_id: string;
  title: string;
  tagline: string;
  href: string;
  logo_text: string | null;
  logo_url: string | null;
  bg_color: string | null;
  created_at: string;
};

export async function getSlotsSold(): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  // Consider "slots sold" as any paid slot that is in-flight or live.
  // (initiated doesn't count; it may never complete)
  const { count, error } = await db
    .from("sponsor_orders")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending_approval", "active"]);

  if (error) throw error;
  return count ?? 0;
}

export async function createSponsorOrder(input: {
  priceCents: number;
  slotsSoldAtPurchase: number;
}): Promise<{ id: string }> {
  const db = getDb();
  if (!db) throw new Error("Database not configured (missing Supabase env vars)");

  const { data, error } = await db
    .from("sponsor_orders")
    .insert({
      status: "initiated" satisfies SponsorOrderStatus,
      price_cents: input.priceCents,
      slots_sold_at_purchase: input.slotsSoldAtPurchase,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

export async function attachStripeSessionToOrder(input: {
  orderId: string;
  stripeCheckoutSessionId: string;
  purchaserEmail?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("sponsor_orders")
    .update({
      stripe_checkout_session_id: input.stripeCheckoutSessionId,
      purchaser_email: input.purchaserEmail ?? null,
    })
    .eq("id", input.orderId);

  if (error) throw error;
}

export async function markOrderPendingApproval(input: {
  orderId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  purchaserEmail?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("sponsor_orders")
    .update({
      status: "pending_approval" satisfies SponsorOrderStatus,
      stripe_customer_id: input.stripeCustomerId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      purchaser_email: input.purchaserEmail ?? null,
    })
    .eq("id", input.orderId);

  if (error) throw error;
}

export async function markOrderCanceledBySubscription(input: {
  stripeSubscriptionId: string;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("sponsor_orders")
    .update({
      status: "canceled" satisfies SponsorOrderStatus,
      canceled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", input.stripeSubscriptionId);

  if (error) throw error;
}

export async function getActiveSponsorCards(limit = 19): Promise<SponsorCardRow[]> {
  const db = getDb();
  if (!db) return [];

  const { data, error } = await db.from("sponsor_active_cards").select("*").limit(limit);
  if (error) throw error;
  return (data ?? []) as SponsorCardRow[];
}
