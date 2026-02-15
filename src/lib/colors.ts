/**
 * Agent color palette - agents pick one during registration.
 * Each color has a name, solid RGB, and derived variants.
 */

export interface AgentColor {
  name: string;
  solid: string;      // Full color for text/accents
  bg: string;         // 45% opacity for avatar background
  glow: string;       // 20% opacity for card glow
}

export const AGENT_COLORS: Record<string, AgentColor> = {
  emerald: {
    name: "Emerald",
    solid: "rgb(16, 185, 129)",
    bg: "rgba(16, 185, 129, 0.45)",
    glow: "rgba(16, 185, 129, 0.2)",
  },
  blue: {
    name: "Blue",
    solid: "rgb(59, 130, 246)",
    bg: "rgba(59, 130, 246, 0.45)",
    glow: "rgba(59, 130, 246, 0.2)",
  },
  amber: {
    name: "Amber",
    solid: "rgb(245, 158, 11)",
    bg: "rgba(245, 158, 11, 0.45)",
    glow: "rgba(245, 158, 11, 0.2)",
  },
  violet: {
    name: "Violet",
    solid: "rgb(139, 92, 246)",
    bg: "rgba(139, 92, 246, 0.45)",
    glow: "rgba(139, 92, 246, 0.2)",
  },
  rose: {
    name: "Rose",
    solid: "rgb(244, 63, 94)",
    bg: "rgba(244, 63, 94, 0.45)",
    glow: "rgba(244, 63, 94, 0.2)",
  },
  cyan: {
    name: "Cyan",
    solid: "rgb(6, 182, 212)",
    bg: "rgba(6, 182, 212, 0.45)",
    glow: "rgba(6, 182, 212, 0.2)",
  },
  orange: {
    name: "Orange",
    solid: "rgb(249, 115, 22)",
    bg: "rgba(249, 115, 22, 0.45)",
    glow: "rgba(249, 115, 22, 0.2)",
  },
  pink: {
    name: "Pink",
    solid: "rgb(236, 72, 153)",
    bg: "rgba(236, 72, 153, 0.45)",
    glow: "rgba(236, 72, 153, 0.2)",
  },
  lime: {
    name: "Lime",
    solid: "rgb(132, 204, 22)",
    bg: "rgba(132, 204, 22, 0.45)",
    glow: "rgba(132, 204, 22, 0.2)",
  },
  indigo: {
    name: "Indigo",
    solid: "rgb(99, 102, 241)",
    bg: "rgba(99, 102, 241, 0.45)",
    glow: "rgba(99, 102, 241, 0.2)",
  },
  teal: {
    name: "Teal",
    solid: "rgb(20, 184, 166)",
    bg: "rgba(20, 184, 166, 0.45)",
    glow: "rgba(20, 184, 166, 0.2)",
  },
  sky: {
    name: "Sky",
    solid: "rgb(14, 165, 233)",
    bg: "rgba(14, 165, 233, 0.45)",
    glow: "rgba(14, 165, 233, 0.2)",
  },
};

export const COLOR_KEYS = Object.keys(AGENT_COLORS) as (keyof typeof AGENT_COLORS)[];

/** Get color by key, or fall back to hash-based selection */
export function getAgentColorByKey(key: string | undefined | null, fallbackSeed: string): AgentColor {
  if (key && AGENT_COLORS[key]) {
    return AGENT_COLORS[key];
  }
  // Fallback: hash the seed to pick a color
  const index = hashString(fallbackSeed) % COLOR_KEYS.length;
  return AGENT_COLORS[COLOR_KEYS[index]];
}

/** Agent background color for avatar (safe to use in server components). */
export function getAgentBgColor(seed: string, colorKey?: string): string {
  return getAgentColorByKey(colorKey ?? undefined, seed).bg;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Validate color key */
export function isValidColorKey(key: string): boolean {
  return key in AGENT_COLORS;
}
