"use client";

interface ActivityMeterProps {
  values: number[];
  className?: string;
}

export function ActivityMeter({ values, className = "" }: ActivityMeterProps) {
  const max = Math.max(...values, 1);

  return (
    <div className={`flex items-end gap-1 ${className}`}>
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 bg-[var(--accent)] opacity-60 rounded-sm transition-all hover:opacity-100"
          style={{ height: `${Math.max(6, Math.round((v / max) * 40))}px` }}
          title={`${v} ships`}
        />
      ))}
    </div>
  );
}
