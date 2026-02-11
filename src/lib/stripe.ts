import "server-only";

import Stripe from "stripe";

function getSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || process.env.STRIPE_API_KEY;
}

export function getStripe(): Stripe {
  const key = getSecretKey();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY (or STRIPE_SECRET/STRIPE_API_KEY)");
  }
  return new Stripe(key, {
    // Keep in sync with Stripe SDK bundled API version types.
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
}
