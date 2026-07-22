"use client";

import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
}

/**
 * Dependency-free responsive bar chart. Good enough for admin dashboards
 * without pulling in a charting library. Swap for Recharts if you need axes,
 * tooltips, or multiple series.
 */
export function BarChart({
  data,
  className,
  height = 180,
}: {
  data: BarDatum[];
  className?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex gap-3"
        style={{ height }}
        role="img"
        aria-label="Bar chart"
      >
        {data.map((d) => (
          <div
            key={d.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-xs font-medium text-foreground/70">{d.value}</span>
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
              style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
