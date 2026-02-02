interface ActivityMeterProps {
  values: number[];
  size?: "sm" | "md" | "lg" | "xl";
}

export function ActivityMeter({ values, size = "sm" }: ActivityMeterProps) {
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
        className={`flex items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]/50 ${emptyTextSize} font-medium text-[var(--fg-subtle)] uppercase tracking-wider`}
        style={{ height: `${barHeight}px`, width: `${values.length * barWidth + (values.length - 1) * gap}px`, minWidth: "60px" }}
        title="No launches yet"
      >
        No launches yet
      </div>
    );
  }

  const max = Math.max(...values, 1);

  return (
    <div 
      className="flex items-end" 
      style={{ gap: `${gap}px`, height: `${barHeight}px` }}
      title={`7-day activity: ${values.join(", ")}`}
    >
      {values.map((v, i) => {
        const height = Math.max((v / max) * barHeight, 2);
        const isToday = i === values.length - 1;
        
        return (
          <div
            key={i}
            className={`rounded-sm transition-all ${
              v === 0
                ? "bg-[var(--border)]"
                : isToday
                ? "bg-[var(--accent)]"
                : "bg-[var(--fg-muted)]"
            }`}
            style={{
              width: `${barWidth}px`,
              height: `${height}px`,
            }}
          />
        );
      })}
    </div>
  );
}
