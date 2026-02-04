"use client";

import { useMemo } from "react";
import { hashToBitmap, hashToHue, encodeBadgeInBitmap, hash32 } from "@/lib/hash-bitmap";
import { BADGE_CATALOG, type BadgeTier } from "@/lib/badges";

const TIER_FILL: Record<BadgeTier, string> = {
  1: "rgb(217, 119, 6)",
  2: "rgb(156, 163, 175)",
  3: "rgb(234, 179, 8)",
  4: "rgb(167, 139, 250)",
  5: "rgb(200, 220, 255)",
  6: "rgb(200, 220, 255)",
  7: "rgb(200, 220, 255)",
};

/** Multi-color palette for tier 6 (Transcendent): teal, red, white, pink */
const MULTICOLOR_PALETTE = [
  "rgb(20, 184, 166)",   // teal
  "rgb(244, 63, 94)",    // red
  "rgb(255, 255, 255)",  // white
  "rgb(236, 72, 153)",   // pink
] as const;

/** Multi-color palette for tier 7 (Ascendant): gold, violet, cyan, white */
const ASCENDANT_PALETTE = [
  "rgb(251, 191, 36)",   // gold
  "rgb(139, 92, 246)",   // violet
  "rgb(34, 211, 238)",   // cyan
  "rgb(255, 255, 255)",  // white
] as const;

const CATALOG_IDS = BADGE_CATALOG.map((b) => b.id);

export interface BitmapBadgeProps {
  seed: string;
  size?: number;
  pixelSize?: number;
  tint?: "tier" | "hash" | "none";
  tier?: BadgeTier;
  /** When set with tint="tier", the first row encodes the catalog index so agents can decode the badge. */
  badgeId?: string;
  className?: string;
}

export function BitmapBadge({
  seed,
  size = 8,
  pixelSize = 6,
  tint = "hash",
  tier = 1,
  badgeId,
  className = "",
}: BitmapBadgeProps) {
  const grid = useMemo(() => {
    if (badgeId && tint === "tier") {
      return encodeBadgeInBitmap(badgeId, tier, CATALOG_IDS, size, size);
    }
    return hashToBitmap(seed, size, size);
  }, [seed, size, tint, tier, badgeId]);

  const isMulticolorTier6 = tier === 6 && tint === "tier";
  const isMulticolorTier7 = tier === 7 && tint === "tier";
  const fillColor =
    tint === "tier"
      ? TIER_FILL[tier]
      : tint === "hash"
        ? `hsl(${hashToHue(seed)}, 70%, 55%)`
        : "var(--fg-muted)";

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${size}, ${pixelSize}px)`,
    gridTemplateRows: `repeat(${size}, ${pixelSize}px)`,
    width: size * pixelSize + (size - 1) * 2,
    height: size * pixelSize + (size - 1) * 2,
    imageRendering: "pixelated",
  };

  const palette = isMulticolorTier7 ? ASCENDANT_PALETTE : isMulticolorTier6 ? MULTICOLOR_PALETTE : null;
  const usePalette = palette !== null;

  return (
    <div
      className={`inline-grid gap-0.5 ${className}`}
      style={gridStyle}
      aria-hidden
    >
      {grid.flatMap((row, y) =>
        row.map((on, x) => {
          const pixelColor = usePalette && on
            ? palette[((hash32(`${badgeId ?? ""}:${tier}:${y}:${x}`) >>> 0) % palette.length)]
            : on
              ? fillColor
              : "transparent";
          return (
            <div
              key={`${y}-${x}`}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: pixelColor,
                borderRadius: 0,
              }}
            />
          );
        })
      )}
    </div>
  );
}
