"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TrendPoint {
  label: string;
  value: number;
  date?: string;
}

/**
 * Dependency-free SVG area/line sparkline for time-series (e.g. leads per day).
 * Renders a smooth gradient fill under a stroked line with a hover tooltip.
 * Swap for Recharts if you need axes or multiple series.
 */
export function TrendChart({
  data,
  className,
  height = 160,
}: {
  data: TrendPoint[];
  className?: string;
  height?: number;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const gradientId = React.useId();
  const width = 600; // viewBox units; scales responsively
  const pad = 6;
  const max = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;
  const step = n > 1 ? (width - pad * 2) / (n - 1) : 0;

  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = height - pad - (d.value / max) * (height - pad * 2);
    return { x, y, d, i };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${pad + (n - 1) * step},${
    height - pad
  }`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Leads over the last 14 days"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p) => (
          <React.Fragment key={p.i}>
            {hover === p.i && (
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--card))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* Wide invisible hit target for hover */}
            <rect
              x={p.x - step / 2}
              y={0}
              width={step || width}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(p.i)}
            />
          </React.Fragment>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{data[0]?.label}</span>
        {hover != null && data[hover] ? (
          <span className="font-medium text-foreground">
            {data[hover]!.value} {data[hover]!.value === 1 ? "lead" : "leads"} ·{" "}
            {data[hover]!.label}
          </span>
        ) : (
          <span>Last {data.length} days</span>
        )}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
