interface ActivityMeterProps {
  values: number[];
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional custom color for bars (overrides default accent) */
  color?: string;
}

export function ActivityMeter({ values, size = "sm", color }: ActivityMeterProps) {
  const total = values.reduce((a, b) => a + b, 0);
  const hasActivity = total > 0;

  const barHeight = size === "xl" ? 72 : size === "lg" ? 56 : size === "md" ? 32 : 22;
  const barWidth = size === "xl" ? 18 : size === "lg" ? 14 : size === "md" ? 9 : 6;
  const gap = size === "xl" ? 7 : size === "lg" ? 6 : size === "md" ? 4 : 3;

  if (!hasActivity) {
    const emptyTextSize =
      size === "xl" ? "text-xs" : size === "lg" ? "text-[11px]" : size === "md" ? "text-[10px]" : "text-[9px]";
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]/50 ${emptyTextSize} font-medium text-[var(--fg-subtle)] uppercase tracking-wider whitespace-nowrap`}
        style={{ height: `${barHeight}px`, minWidth: "90px" }}
        title="No ships yet"
      >
        No ships yet
      </div>
    );
  }

  const max = Math.max(...values, 1);
  // Use square root scaling to make smaller values more visible
  // while still showing relative differences
  const sqrtMax = Math.sqrt(max);

  return (
    <div 
      className="flex items-end" 
      style={{ gap: `${gap}px`, height: `${barHeight}px` }}
      title={`7-day activity: ${values.join(", ")}`}
    >
      {values.map((v, i) => {
        // Square root scaling: makes small counts more visible
        // e.g., with max=28: sqrt(28)≈5.3, sqrt(3)≈1.7 → 32% height instead of 11%
        const scaledHeight = v === 0 ? 0 : (Math.sqrt(v) / sqrtMax) * barHeight;
        // Min height: 2px for empty, 20% of barHeight for any activity
        const minActive = Math.max(barHeight * 0.2, 6);
        const height = v === 0 ? 2 : Math.max(scaledHeight, minActive);
        const isToday = i === values.length - 1;
        
        // Convert rgb() to rgba() for opacity, or use CSS opacity
        const getColorWithOpacity = (c: string, opacity: number): string => {
          if (c.startsWith('rgb(')) {
            return c.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
          }
          if (c.startsWith('#') && c.length === 7) {
            const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
            return `${c}${alpha}`;
          }
          return c; // fallback, just return as-is
        };
        
        const barColor = v === 0 
          ? undefined 
          : color 
            ? (isToday ? color : getColorWithOpacity(color, 0.6))
            : undefined;
        
        return (
          <div
            key={i}
            className={`rounded-sm transition-all ${
              v === 0
                ? "bg-[var(--border)]"
                : !color
                  ? isToday
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--fg-muted)]"
                  : ""
            }`}
            style={{
              width: `${barWidth}px`,
              height: `${height}px`,
              ...(barColor ? { backgroundColor: barColor } : {}),
            }}
          />
        );
      })}
    </div>
  );
}
