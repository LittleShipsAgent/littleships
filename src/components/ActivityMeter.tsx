interface ActivityMeterProps {
  values: number[];
  size?: "sm" | "md" | "lg" | "xl";
}

export function ActivityMeter({ values, size = "sm" }: ActivityMeterProps) {
  const max = Math.max(...values, 1);
  
  const barHeight = size === "xl" ? 72 : size === "lg" ? 56 : size === "md" ? 32 : 22;
  const barWidth = size === "xl" ? 18 : size === "lg" ? 14 : size === "md" ? 9 : 6;
  const gap = size === "xl" ? 7 : size === "lg" ? 6 : size === "md" ? 4 : 3;

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
