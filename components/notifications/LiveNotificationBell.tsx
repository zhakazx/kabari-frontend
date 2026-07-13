"use client";

import Link from "next/link";

import { useEventRealtime } from "@/lib/realtime";
import { IconBell } from "@/components/ui/icons";
import type { Notification } from "@/lib/types";

type LiveResponse = {
  ok: boolean;
  data?: Notification[];
  status?: number;
  message?: string;
};

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/live/notifications", { cache: "no-store" });
  const json = (await res.json()) as LiveResponse;
  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? "Gagal memuat notifikasi");
  }
  return json.data;
}

/**
 * Bell icon + count badge that polls every 30s and listens for WS pushes.
 * Falls back to the SSR'd initial value if the network is unavailable.
 */
export function LiveNotificationBell({
  userId,
  initialCount,
  href = "/notifications",
}: {
  userId: string;
  initialCount: number;
  href?: string;
}) {
  const { data, isValidating } = useEventRealtime<Notification[]>(
    `notifications-count:${userId}`,
    fetchNotifications,
    { kind: "user", id: userId },
    { intervalMs: 30000 },
  );

  const count = data ? data.length : initialCount;
  const showBadge = count > 0;
  const label = count > 99 ? "99+" : String(count);

  return (
    <Link
      href={href}
      aria-label={
        showBadge
          ? `Notifikasi, ${count} belum dibaca`
          : "Notifikasi"
      }
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition hover:bg-surface-muted hover:text-foreground"
    >
      <IconBell size={19} />
      {showBadge ? (
        <>
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-semibold leading-4 text-accent-foreground"
          >
            {label}
          </span>
          {isValidating ? (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 h-4 w-4 animate-ping rounded-full bg-accent/40"
            />
          ) : null}
        </>
      ) : null}
    </Link>
  );
}
