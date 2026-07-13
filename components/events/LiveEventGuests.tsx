"use client";

import { useEventRealtime } from "@/lib/realtime";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { GuestListTable } from "@/components/events/GuestListTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconUsers } from "@/components/ui/icons";
import type { Invitation } from "@/lib/types";

type LiveResponse = {
  ok: boolean;
  data?: Invitation[];
  status?: number;
  message?: string;
};

async function fetchGuests(eventId: string): Promise<Invitation[]> {
  const res = await fetch(`/api/live/event-guests/${eventId}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as LiveResponse;
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? "Gagal memuat daftar tamu");
  }
  return json.data;
}

/**
 * Live view of an event's guest list. Polls every 10s and reacts to RSVP
 * WS pushes so the organizer sees new confirmations without refreshing.
 */
export function LiveEventGuests({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Invitation[];
}) {
  const { data, error, isValidating, refresh } = useEventRealtime(
    `event-guests:${eventId}`,
    () => fetchGuests(eventId),
    { kind: "event", id: eventId },
    { intervalMs: 10000 },
  );

  const items = data ?? initial;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <LiveBadge />
        <span className="text-xs text-foreground/55" aria-live="polite">
          {isValidating
            ? "Memperbarui…"
            : `${items.length} tamu`}
        </span>
      </div>

      {error ? (
        <ErrorState
          title="Tidak dapat memperbarui daftar tamu"
          description="Periksa koneksi Anda lalu coba lagi."
          retry={refresh}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={22} />}
          title="Belum ada tamu"
          description="Tambahkan tamu pertama Anda pada formulir di atas."
        />
      ) : (
        <GuestListTable guests={items} />
      )}
    </div>
  );
}
