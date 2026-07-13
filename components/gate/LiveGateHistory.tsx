"use client";

import { useEventRealtime } from "@/lib/realtime";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { GateHistoryTable } from "@/components/gate/GateHistoryTable";
import { ErrorState } from "@/components/ui/ErrorState";
import type { CheckIn } from "@/lib/types";

type LiveResponse = {
  ok: boolean;
  data?: CheckIn[];
  status?: number;
  message?: string;
};

async function fetchCheckIns(eventId: string): Promise<CheckIn[]> {
  const res = await fetch(`/api/live/check-ins/${eventId}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as LiveResponse;
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? "Gagal memuat check-in");
  }
  return json.data;
}

/**
 * Live view of the gate history. Polls the backend every 5s and also
 * picks up WS events when `NEXT_PUBLIC_REALTIME_URL` is configured.
 */
export function LiveGateHistory({
  eventId,
  initial,
}: {
  eventId: string;
  initial: CheckIn[];
}) {
  const { data, error, isValidating, refresh } = useEventRealtime(
    `gate-history:${eventId}`,
    () => fetchCheckIns(eventId),
    { kind: "event", id: eventId },
    { intervalMs: 5000 },
  );

  const items = data ?? initial;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <LiveBadge />
        <span className="text-xs text-foreground/55" aria-live="polite">
          {isValidating
            ? "Memperbarui…"
            : `${items.length} tamu · terbaru ${new Date().toLocaleTimeString(
                "id-ID",
                { hour: "2-digit", minute: "2-digit" },
              )}`}
        </span>
      </div>

      {error ? (
        <ErrorState
          title="Tidak dapat memperbarui daftar"
          description="Periksa koneksi Anda lalu coba lagi."
          retry={refresh}
        />
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface/60 p-6 text-center text-sm text-foreground/55">
          Belum ada tamu yang check-in.
        </p>
      ) : (
        <GateHistoryTable items={items} />
      )}
    </div>
  );
}
