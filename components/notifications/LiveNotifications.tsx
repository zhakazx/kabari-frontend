"use client";

import { useEventRealtime } from "@/lib/realtime";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { NotificationList } from "@/components/notifications/NotificationList";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Notification } from "@/lib/types";

type LiveResponse = {
  ok: boolean;
  data?: Notification[];
  status?: number;
  message?: string;
};

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`/api/live/notifications`, { cache: "no-store" });
  const json = (await res.json()) as LiveResponse;
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? "Gagal memuat notifikasi");
  }
  return json.data;
}

/**
 * Live view of the user's notifications. Polls every 12s and listens for
 * WS push events when configured.
 */
export function LiveNotifications({
  userId,
  initial,
}: {
  userId: string;
  initial: Notification[];
}) {
  const { data, error, isValidating, refresh } = useEventRealtime(
    `notifications:${userId}`,
    fetchNotifications,
    { kind: "user", id: userId },
    { intervalMs: 12000 },
  );

  const items = Array.isArray(data) ? data : (initial ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <LiveBadge />
        <span className="text-xs text-foreground/55" aria-live="polite">
          {isValidating
            ? "Memperbarui…"
            : `${items.length} kabar · terakhir ${new Date().toLocaleTimeString(
                "id-ID",
                { hour: "2-digit", minute: "2-digit" },
              )}`}
        </span>
      </div>

      {error ? (
        <ErrorState
          title="Tidak dapat memperbarui notifikasi"
          description="Periksa koneksi Anda lalu coba lagi."
          retry={refresh}
        />
      ) : (
        <NotificationList items={items} />
      )}
    </div>
  );
}
