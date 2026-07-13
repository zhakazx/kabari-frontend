"use client";

import { useSyncExternalStore } from "react";

import { IconCalendar, IconClock, IconUserCheck } from "@/components/ui/icons";

/**
 * Live audit strip shown above the scanner. Displays the logged-in
 * operator's name and a ticking clock so every scan is implicitly
 * attributed — the time on the receipt is the same time on this strip.
 *
 * Once the first scan resolves the event (`event` prop), the event name
 * is shown as a third piece of context so the operator can confirm they
 * are scanning into the right acara.
 *
 * `useSyncExternalStore` is the React 19 sanctioned way to read from
 * an external mutable source (the system clock) without tripping the
 * cascading-render rule or producing a hydration mismatch.
 */
export function GateAuditStrip({
  operatorName,
  event,
}: {
  operatorName: string;
  event?: { id: string; name: string } | null;
}) {
  const stamp = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    () => null,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 text-foreground/75">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
            <IconUserCheck size={14} />
          </span>
          <span>
            Operator:{" "}
            <span className="font-medium text-foreground">{operatorName}</span>
          </span>
        </div>
        {event?.name ? (
          <div className="flex items-center gap-2 text-foreground/75">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
              <IconCalendar size={14} />
            </span>
            <span>
              Acara:{" "}
              <span className="font-medium text-foreground">{event.name}</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 text-foreground/65">
        <IconClock size={14} />
        <span
          className="font-mono text-foreground/85"
          suppressHydrationWarning
        >
          {stamp ?? "—"}
        </span>
      </div>
    </div>
  );
}

function subscribeClock(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  cachedClockStamp = formatStamp(new Date());
  const id = window.setInterval(() => {
    const next = formatStamp(new Date());
    if (next !== cachedClockStamp) {
      cachedClockStamp = next;
      callback();
    }
  }, 1000);
  return () => window.clearInterval(id);
}

let cachedClockStamp: string | null = null;

function getClockSnapshot(): string | null {
  if (cachedClockStamp === null && typeof window !== "undefined") {
    cachedClockStamp = formatStamp(new Date());
  }
  return cachedClockStamp;
}

function formatStamp(d: Date): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const hm = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return `${ymd} ${hm}`;
}
