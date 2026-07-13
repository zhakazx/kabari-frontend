import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "text-foreground/55",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-accent",
};

const TONE_BG: Record<Tone, string> = {
  neutral: "bg-surface-muted",
  success: "bg-success-soft",
  warning: "bg-warning-soft",
  danger: "bg-danger-soft",
  info: "bg-accent-soft",
};

/**
 * Compact metric tile. Renders a label, a big value, an optional sub-line
 * (e.g. "3 belum dibayar"), and an icon in the top-right corner.
 *
 * `href` turns the whole tile into a link (used on the pelanggan dashboard
 * to deep-link to /orders?status=pending, etc.).
 */
export function StatTile({
  label,
  value,
  icon,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  tone?: Tone;
  href?: string;
}) {
  const body = (
    <Card className="h-full transition hover:border-foreground/20">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
            {label}
          </span>
          {icon ? (
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md",
                TONE_BG[tone],
                TONE_CLASS[tone],
              )}
            >
              {icon}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1">
          <span className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          {hint ? (
            <span className={cn("text-xs", TONE_CLASS[tone])}>{hint}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return body;

  return (
    <a href={href} className="block focus-visible:outline-none">
      {body}
    </a>
  );
}
