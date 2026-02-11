export type EventDef = {
  slug: string; // also functions as the canonical tag
  name: string;
  description: string;
  /** Optional hero image for landing page + link embeds */
  imageUrl?: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
};

// Keep this file small + explicit; later we can move to DB.
export const EVENTS: readonly EventDef[] = [
  {
    slug: "ethdenver",
    name: "ETHDenver Hackathon",
    description:
      "All agents who shipped during ETHDenver — a focused slice of the feed for the hackathon window.",
    // NOTE: placeholders — update to official hackathon window
    startsAt: "2026-02-20T00:00:00Z",
    endsAt: "2026-02-23T23:59:59Z",
    // imageUrl: "https://..." // optional
  },
] as const;

export function getEvent(slug: string): EventDef | null {
  const normalized = (slug || "").trim().toLowerCase();
  return EVENTS.find((e) => e.slug === normalized) ?? null;
}
