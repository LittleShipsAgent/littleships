"use client";

interface BotAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  /** Agent id or handle — used to pick a consistent color background per agent. */
  seed?: string;
  className?: string;
  /** Optional extra class for the emoji (e.g. text-5xl to make icon bigger without changing the square). */
  iconClassName?: string;
}

const containerClasses = {
  sm: "w-10 h-10 rounded-xl",
  md: "w-14 h-14 rounded-xl",
  lg: "w-20 h-20 rounded-2xl",
  xl: "w-28 h-28 rounded-2xl",
};

const iconClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

/** Varying tint backgrounds (bitmap-style dot grid overlays these) */
const AGENT_BG = [
  "rgba(16, 185, 129, 0.45)",
  "rgba(59, 130, 246, 0.45)",
  "rgba(245, 158, 11, 0.45)",
  "rgba(139, 92, 246, 0.45)",
  "rgba(244, 63, 94, 0.45)",
  "rgba(6, 182, 212, 0.45)",
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function bgForSeed(seed: string): string {
  return AGENT_BG[hash(seed) % AGENT_BG.length];
}

/** Same RGB as AGENT_BG, lower alpha for card glow */
const AGENT_GLOW = [
  "rgba(16, 185, 129, 0.2)",
  "rgba(59, 130, 246, 0.2)",
  "rgba(245, 158, 11, 0.2)",
  "rgba(139, 92, 246, 0.2)",
  "rgba(244, 63, 94, 0.2)",
  "rgba(6, 182, 212, 0.2)",
] as const;

/** Solid colors for text/accents (same hue as avatar, full saturation) */
const AGENT_COLORS = [
  "rgb(16, 185, 129)",   // emerald
  "rgb(59, 130, 246)",   // blue
  "rgb(245, 158, 11)",   // amber
  "rgb(139, 92, 246)",   // violet
  "rgb(244, 63, 94)",    // rose
  "rgb(6, 182, 212)",    // cyan
] as const;

/** Agent color for glow (e.g. ProofCard box-shadow). Same seed = same color as BotAvatar. */
export function getAgentGlowColor(seed: string): string {
  return AGENT_GLOW[hash(seed) % AGENT_GLOW.length];
}

/** Agent solid color for text/charts. Same seed = same color as BotAvatar. */
export function getAgentColor(seed: string): string {
  return AGENT_COLORS[hash(seed) % AGENT_COLORS.length];
}

const EMOJI = "🤖";

export function BotAvatar({ size = "md", seed, className = "", iconClassName }: BotAvatarProps) {
  const tint = seed ? bgForSeed(seed) : "var(--accent-muted)";
  const baseBg = `linear-gradient(135deg, var(--bg-muted) 0%, var(--bg-subtle) 100%)`;
  const tintBg = `radial-gradient(ellipse 90% 90% at 50% 50%, ${tint} 0%, transparent 70%)`;
  const bitmapDots = `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`;
  const bitmapSize = "6px 6px";
  const iconSizeClass = iconClassName ?? iconClasses[size];

  return (
    <div
      className={`${containerClasses[size]} flex items-center justify-center shrink-0 overflow-hidden relative border border-[var(--border)] ${className}`}
      aria-hidden
    >
      {/* Base + varying color tint */}
      <div
        className="absolute inset-0 opacity-95"
        style={{ background: `${tintBg}, ${baseBg}` }}
      />
      {/* Bitmap effect: dot grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: bitmapDots,
          backgroundSize: bitmapSize,
        }}
      />
      {/* Emoji on top */}
      <span className={`relative z-10 leading-none ${iconSizeClass}`}>{EMOJI}</span>
    </div>
  );
}
