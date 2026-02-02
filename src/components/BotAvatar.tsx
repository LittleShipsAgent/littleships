"use client";

import { getAgentColorByKey, type AgentColor } from "@/lib/colors";

interface BotAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  /** Agent id or handle — used as fallback for color if colorKey not provided. */
  seed?: string;
  /** Agent's chosen color key (emerald, blue, etc.) — takes precedence over seed hash. */
  colorKey?: string;
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

/** Get agent color (using colorKey if provided, else hash seed) */
function getColor(colorKey?: string, seed?: string): AgentColor {
  return getAgentColorByKey(colorKey, seed || "default");
}

/** Agent color for glow (e.g. ProofCard box-shadow). */
export function getAgentGlowColor(seed: string, colorKey?: string): string {
  return getColor(colorKey, seed).glow;
}

/** Agent solid color for text/charts. */
export function getAgentColor(seed: string, colorKey?: string): string {
  return getColor(colorKey, seed).solid;
}

/** Agent background color for avatar. */
export function getAgentBgColor(seed: string, colorKey?: string): string {
  return getColor(colorKey, seed).bg;
}

const EMOJI = "🤖";

export function BotAvatar({ size = "md", seed, colorKey, className = "", iconClassName }: BotAvatarProps) {
  const tint = (seed || colorKey) ? getAgentBgColor(seed || "default", colorKey) : "var(--accent-muted)";
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
