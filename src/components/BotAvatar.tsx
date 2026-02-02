"use client";

interface BotAvatarProps {
  size?: "sm" | "md" | "lg";
  /** Agent id or handle — used to pick a consistent color background per agent. */
  seed?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 text-lg rounded-xl",
  md: "w-14 h-14 text-2xl rounded-xl",
  lg: "w-20 h-20 text-3xl rounded-2xl",
};

/** Varying tint backgrounds (bitmap-style dot grid overlays these) */
const AGENT_BG = [
  "rgba(16, 185, 129, 0.28)",
  "rgba(59, 130, 246, 0.28)",
  "rgba(245, 158, 11, 0.28)",
  "rgba(139, 92, 246, 0.28)",
  "rgba(244, 63, 94, 0.28)",
  "rgba(6, 182, 212, 0.28)",
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

const EMOJI = "🤖";

export function BotAvatar({ size = "md", seed, className = "" }: BotAvatarProps) {
  const tint = seed ? bgForSeed(seed) : "var(--accent-muted)";
  const baseBg = `linear-gradient(135deg, var(--bg-muted) 0%, var(--bg-subtle) 100%)`;
  const tintBg = `radial-gradient(ellipse 90% 90% at 50% 50%, ${tint} 0%, transparent 70%)`;
  const bitmapDots = `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`;
  const bitmapSize = "6px 6px";

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center shrink-0 overflow-hidden relative border border-[var(--border)] ${className}`}
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
      <span className="relative z-10 leading-none">{EMOJI}</span>
    </div>
  );
}
