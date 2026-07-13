import { cn, formatDateTime } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { IconCalendar, IconArrowRight } from "@/components/ui/icons";

/**
 * Hero block for a public invitation. Renders event name, formatted date, and
 * a CTA to the maps link when present. A thin seal-style ornament is used as
 * the signature — it's a single accent line that ties this surface to the
 * brand language used on the landing and auth pages.
 */
export function EventHero({
  event,
  mapsLabel = "Lihat lokasi",
  className,
}: {
  event: Event;
  mapsLabel?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface px-6 py-10 shadow-card sm:px-10 sm:py-14",
        className,
      )}
    >
      <div
        aria-hidden
        className="qr-grid absolute inset-0 text-foreground/[0.035]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full border border-accent/30 bg-accent-soft/60 blur-2xl"
      />

      <div className="relative flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
          <span className="h-1 w-6 bg-accent/70" aria-hidden />
          Undangan
        </span>

        <h1 className="max-w-2xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
          {event.event_name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/70">
          <span className="inline-flex items-center gap-2">
            <IconCalendar size={16} className="text-accent/80" />
            {formatDateTime(event.event_date)}
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-foreground/25 sm:inline-block" />
          <span className="font-medium text-foreground/85">
            {event.venue_name}
          </span>
          {event.venue_address ? (
            <span className="text-foreground/55">· {event.venue_address}</span>
          ) : null}
        </div>

        {event.maps_url ? (
          <div className="pt-1">
            <Button
              href={event.maps_url}
              variant="outline"
              size="md"
              external
            >
              {mapsLabel}
              <IconArrowRight size={16} />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
