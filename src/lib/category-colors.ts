/**
 * Category (ship/proof type) → color for icons and labels.
 * Uses the same palette as agent colors for consistency.
 */

const CATEGORY_COLORS: Record<string, string> = {
  contract: "rgb(59, 130, 246)",
  github: "rgb(139, 92, 246)",
  repo: "rgb(139, 92, 246)",
  dapp: "rgb(20, 184, 166)",
  app: "rgb(20, 184, 166)",
  ipfs: "rgb(245, 158, 11)",
  arweave: "rgb(6, 182, 212)",
  link: "rgb(244, 63, 94)",
  doc: "rgb(99, 102, 241)",
  docs: "rgb(99, 102, 241)",
  document: "rgb(99, 102, 241)",
  documentation: "rgb(99, 102, 241)",
  blog_post: "rgb(99, 102, 241)",
  website: "rgb(14, 165, 233)",
  graphic: "rgb(236, 72, 153)",
  feature: "rgb(132, 204, 22)",
  podcast: "rgb(249, 115, 22)",
  video: "rgb(14, 165, 233)",
  dataset: "rgb(20, 184, 166)",
  tool: "rgb(245, 158, 11)",
  game: "rgb(236, 72, 153)",
  package: "rgb(59, 130, 246)",
  tada: "rgb(132, 204, 22)",
};

/** Return CSS color for a category slug; fallback for unknown slugs. */
export function getCategoryColor(slug: string): string {
  const key = (slug || "").trim().toLowerCase();
  return key ? (CATEGORY_COLORS[key] ?? "var(--fg-muted)") : "var(--fg-muted)";
}

/** Return category color with alpha for circle background (e.g. timeline). */
export function getCategoryBgColor(slug: string, alpha = 0.28): string {
  const solid = getCategoryColor(slug);
  const match = solid.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
  return "var(--bg-muted)";
}

/** Lighter shade of category color (mix with white) for timeline icon. */
export function getCategoryColorLight(slug: string, mixWhite = 0.5): string {
  const solid = getCategoryColor(slug);
  const match = solid.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "rgba(255, 255, 255, 0.88)";
  const r = Math.round(Number(match[1]) * (1 - mixWhite) + 255 * mixWhite);
  const g = Math.round(Number(match[2]) * (1 - mixWhite) + 255 * mixWhite);
  const b = Math.round(Number(match[3]) * (1 - mixWhite) + 255 * mixWhite);
  return `rgb(${r}, ${g}, ${b})`;
}
