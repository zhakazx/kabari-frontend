import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/lib/utils";

const TONES: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-foreground/70 border-border",
  info: "bg-info-soft text-info border-info/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

const DOTS: Record<BadgeVariant, string> = {
  neutral: "bg-foreground/40",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
}: {
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        TONES[variant],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[variant])} />}
      {children}
    </span>
  );
}
