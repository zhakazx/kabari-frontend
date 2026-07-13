"use client";

import { useEventRealtime } from "@/lib/realtime";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { EventStatsGrid } from "@/components/events/EventStatsGrid";
import { ErrorState } from "@/components/ui/ErrorState";
import type { EventDashboardStats } from "@/lib/types";

type LiveResponse = {
  ok: boolean;
  data?: EventDashboardStats;
  status?: number;
  message?: string;
};

async function fetchStats(eventId: string): Promise<EventDashboardStats> {
  const res = await fetch(`/api/live/event-dashboard/${eventId}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as LiveResponse;
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? "Gagal memuat statistik");
  }
  return json.data;
}

/**
 * Live view of the event dashboard. The numbers re-fetch every 8s and
 * also on focus so an organizer watching the page during check-in sees
 * updates without a manual refresh.
 */
export function LiveEventDashboard({
  eventId,
  initial,
}: {
  eventId: string;
  initial: EventDashboardStats;
}) {
  const { data, error, isValidating, refresh } = useEventRealtime(
    `event-dashboard:${eventId}`,
    () => fetchStats(eventId),
    { kind: "event", id: eventId },
    { intervalMs: 8000 },
  );

  const stats = data ?? initial;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <LiveBadge />
        <span className="text-xs text-foreground/55" aria-live="polite">
          {isValidating ? "Memperbarui…" : "Terbaru"}
        </span>
      </div>

      {error ? (
        <ErrorState
          title="Tidak dapat memperbarui statistik"
          description="Periksa koneksi Anda lalu coba lagi."
          retry={refresh}
        />
      ) : (
        <EventStatsGrid stats={stats} />
      )}
    </div>
  );
}
