import { cn } from "@/lib/utils";

/**
 * Small "live" pill — used next to a section heading to tell the user that
 * the numbers on the page will update on their own.
 */
export function LiveBadge({
  className,
  label = "Live",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-success",
        className,
      )}
      aria-label={`${label} — data diperbarui otomatis`}
    >
      <span
        aria-hidden
        className="relative inline-flex h-1.5 w-1.5 items-center justify-center"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      {label}
    </span>
  );
}
