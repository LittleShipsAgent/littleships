import "server-only";

export type SponsorPricingConfig = {
  startCents: number; // e.g. 59900
  stepCents: number; // e.g. 30000
  capCents: number; // e.g. 299900
  paidSlotsTotal: number; // e.g. 19
};

export const defaultSponsorPricing: SponsorPricingConfig = {
  startCents: 59900,
  stepCents: 15000,
  capCents: 299900,
  paidSlotsTotal: 19,
};

export function computeSponsorPriceCents(slotsSold: number, cfg: SponsorPricingConfig = defaultSponsorPricing): number {
  const raw = cfg.startCents + Math.max(0, slotsSold) * cfg.stepCents;
  return Math.min(raw, cfg.capCents);
}
