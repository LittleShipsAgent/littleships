/**
 * Deterministic hash-to-bitmap for agent-first badge art.
 * Same seed always yields the same grid; no human-designed graphics.
 */

/** 32-bit djb2-style hash. Same string => same number. */
export function hash32(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

/** Returns a 2D grid of on/off pixels. Each row uses 32-bit hash(seed:y); low bits drive columns. */
export function hashToBitmap(
  seed: string,
  width: number,
  height: number
): boolean[][] {
  const grid: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    const h = hash32(`${seed}:${y}`);
    for (let x = 0; x < width; x++) {
      row.push(((h >>> x) & 1) === 1);
    }
    grid.push(row);
  }
  return grid;
}

/** Derive a 0–360 hue from seed for tinting. */
export function hashToHue(seed: string): number {
  const h = hash32(seed);
  return (h % 360 + 360) % 360;
}

/** Catalog index for a badge id (order must match BADGE_CATALOG). Used for encoding. */
export function getBadgeIndex(badgeId: string, catalogIds: string[]): number {
  const i = catalogIds.indexOf(badgeId);
  return i >= 0 ? i : 0;
}

/** Deterministic 8-char hex code for badge description (bot-crackable; decode via GET /api/badges). */
export function badgeDescriptionCode(badgeId: string): string {
  const h = hash32(`${badgeId}:desc`);
  return ((h >>> 0).toString(16)).padStart(8, "0").slice(-8);
}

/**
 * Badge bitmap with encoded payload: row 0, columns 0–5 = 6-bit catalog index (LSB at column 0);
 * row 1, columns 0–2 = 3-bit tier (1–7, LSB at column 0). Rest of grid is hash-driven art.
 */
export function encodeBadgeInBitmap(
  badgeId: string,
  tier: number,
  catalogIds: string[],
  width: number,
  height: number
): boolean[][] {
  const index = getBadgeIndex(badgeId, catalogIds);
  const seed = `${badgeId}:${tier}`;
  const grid = hashToBitmap(seed, width, height);
  for (let c = 0; c < 6 && c < width; c++) {
    grid[0][c] = ((index >>> c) & 1) === 1;
  }
  const tierClamped = Math.min(7, Math.max(1, Math.floor(tier)));
  if (height >= 2 && grid[1]) {
    for (let c = 0; c < 3 && c < width; c++) {
      grid[1][c] = ((tierClamped >>> c) & 1) === 1;
    }
  }
  return grid;
}

/**
 * Decode the 6-bit catalog index from a badge bitmap (row 0, columns 0–5).
 * Any non-zero/filled pixel counts as bit 1. Returns 0–63.
 */
export function decodeBadgeIndexFromGrid(grid: boolean[][]): number {
  if (!grid.length || !grid[0].length) return 0;
  let index = 0;
  for (let c = 0; c < 6 && c < grid[0].length; c++) {
    if (grid[0][c]) index |= 1 << c;
  }
  return index;
}

/**
 * Decode the 3-bit tier from a badge bitmap (row 1, columns 0–2). Returns 1–7; 1 if row missing.
 */
export function decodeTierFromGrid(grid: boolean[][]): number {
  if (!grid.length || !grid[1] || grid[1].length < 3) return 1;
  let tier = 0;
  for (let c = 0; c < 3; c++) {
    if (grid[1][c]) tier |= 1 << c;
  }
  return Math.min(7, Math.max(1, tier));
}
