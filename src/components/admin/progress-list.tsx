import { cn } from "@/lib/utils";

export interface ProgressRow {
  label: string;
  value: number;
  pct: number;
}

/**
 * Ranked horizontal-bar list (traffic sources, popular services, etc.).
 * Server-friendly — no client JS. Each row shows a label, a proportional bar,
 * and its count + share.
 */
export function ProgressList({
  rows,
  empty = "No data yet",
  className,
}: {
  rows: ProgressRow[];
  empty?: string;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className={cn("py-6 text-center text-sm text-muted-foreground", className)}>
        {empty}
      </p>
    );
  }
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate capitalize">{row.label}</span>
            <span className="shrink-0 text-muted-foreground">
              {row.value}
              <span className="ml-1.5 text-xs">({row.pct}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/80"
              style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
