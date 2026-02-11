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

export type SponsorOrderRow = {
  id: string;
  created_at: string;
  updated_at: string;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SponsorOrderStatus;
  price_cents: number;
  slots_sold_at_purchase: number;
  purchaser_email: string | null;
};

export async function getActiveSponsorCards(limit = 19): Promise<SponsorCardRow[]> {
  const db = getDb();
  if (!db) return [];

  const { data, error } = await db.from("sponsor_active_cards").select("*").limit(limit);
  if (error) throw error;
  return (data ?? []) as SponsorCardRow[];
}

export async function listPendingSponsorOrders(limit = 50): Promise<SponsorOrderRow[]> {
  const db = getDb();
  if (!db) return [];

  const { data, error } = await db
    .from("sponsor_orders")
    .select(
      "id,created_at,updated_at,stripe_checkout_session_id,stripe_customer_id,stripe_subscription_id,status,price_cents,slots_sold_at_purchase,purchaser_email"
    )
    .eq("status", "pending_approval")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as SponsorOrderRow[];
}

export async function approveSponsorOrder(input: {
  orderId: string;
  creative: {
    title: string;
    tagline: string;
    href: string;
    logoText?: string | null;
    logoUrl?: string | null;
    bgColor?: string | null;
  };
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  // Mark order active
  const { error: e1 } = await db
    .from("sponsor_orders")
    .update({
      status: "active" satisfies SponsorOrderStatus,
      approved_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);
  if (e1) throw e1;

  // Create (or replace) creative
  const { error: e2 } = await db.from("sponsor_creatives").upsert(
    {
      order_id: input.orderId,
      title: input.creative.title,
      tagline: input.creative.tagline,
      href: input.creative.href,
      logo_text: input.creative.logoText ?? null,
      logo_url: input.creative.logoUrl ?? null,
      bg_color: input.creative.bgColor ?? null,
    },
    { onConflict: "order_id" }
  );
  if (e2) throw e2;
}

export async function rejectSponsorOrder(input: { orderId: string }): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("sponsor_orders")
    .update({
      status: "rejected" satisfies SponsorOrderStatus,
      rejected_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  if (error) throw error;
}
