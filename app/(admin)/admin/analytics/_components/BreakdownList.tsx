import { cn } from "@/lib/utils";

/**
 * Renders a `Record<string, number>` as a labeled list with a small
 * visual bar. Used for the platform KPI breakdown cards (users by role,
 * events by status, …). The `keyLabel` map translates the snake_case
 * keys returned by the backend into Indonesian labels.
 */
export function BreakdownList({
  data,
  keyLabel,
  className,
}: {
  data: Record<string, number>;
  keyLabel?: Record<string, string>;
  className?: string;
}) {
  const entries = Object.entries(data ?? {});
  const total = entries.reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
  const max = entries.reduce(
    (acc, [, v]) => Math.max(acc, Number(v) || 0),
    0,
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm italic text-foreground/45">
        Belum ada data.
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {entries.map(([key, raw]) => {
        const value = Number(raw) || 0;
        const percent = total > 0 ? Math.round((value / total) * 100) : 0;
        const barWidth = max > 0 ? Math.round((value / max) * 100) : 0;
        return (
          <li key={key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-foreground/80">
                {keyLabel?.[key] ?? key}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-medium text-foreground tabular-nums">
                  {value.toLocaleString("id-ID")}
                </span>
                <span className="text-xs tabular-nums text-foreground/45">
                  {percent}%
                </span>
              </span>
            </div>
            <div
              role="presentation"
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
            >
              <div
                className="h-full rounded-full bg-accent/80"
                style={{ width: `${barWidth}%` }}
                title={`${keyLabel?.[key] ?? key}: ${value.toLocaleString("id-ID")} (${percent}%)`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
