"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

/**
 * Realtime refresh hook. The backend has no live transport for RSVP / check-in
 * yet, so this implementation ships the SWR-polling fallback from the Phase 9
 * plan: subscribe to a fetcher at a fixed interval, expose the latest
 * payload + a manual `refresh` callback, and stop the timer when the page
 * is hidden to avoid background network work.
 *
 * If `NEXT_PUBLIC_REALTIME_URL` is set, the hook also opens a WebSocket on
 * mount. Each message is expected to be a stringified event id; receiving
 * one immediately re-runs the fetcher so the UI catches up.
 */

type RealtimeEvent =
  | { kind: "rsvp"; eventId: string }
  | { kind: "check-in"; eventId: string }
  | { kind: "notification"; userId: string };

type Options = {
  /** How often to refetch when the page is visible. Defaults to 8s. */
  intervalMs?: number;
  /** Skip fetching on the server. Defaults to true. */
  revalidateOnFocus?: boolean;
};

type Scope = { kind: "event" | "user"; id: string };

function readRealtimeUrl(): string | null {
  if (typeof process === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_REALTIME_URL;
  return url && url.length > 0 ? url : null;
}

export function useEventRealtime<T>(
  key: string,
  fetcher: () => Promise<T>,
  scope: Scope,
  options: Options = {},
) {
  const { intervalMs = 8000, revalidateOnFocus = true } = options;
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const wsUrl = useMemo(() => readRealtimeUrl(), []);

  const swr = useSWR<T>(key, fetcher, {
    refreshInterval: () => {
      if (typeof document === "undefined") return 0;
      return document.visibilityState === "visible" ? intervalMs : 0;
    },
    revalidateOnFocus,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!wsUrl) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      try {
        socket = new WebSocket(wsUrl as string);
      } catch {
        reconnectTimer = setTimeout(connect, 5000);
        return;
      }

      socket.addEventListener("message", (msg) => {
        try {
          const data = JSON.parse(String(msg.data)) as {
            kind?: string;
            eventId?: string;
            userId?: string;
          };
          if (!data || typeof data !== "object") return;
          const kind = data.kind;
          if (kind === "rsvp" || kind === "check-in") {
            if (
              scope.kind === "event" &&
              typeof data.eventId === "string" &&
              data.eventId === scope.id
            ) {
              setLastEvent({ kind, eventId: data.eventId });
              void swr.mutate();
            }
          } else if (kind === "notification") {
            if (
              scope.kind === "user" &&
              typeof data.userId === "string" &&
              data.userId === scope.id
            ) {
              setLastEvent({ kind: "notification", userId: data.userId });
              void swr.mutate();
            }
          }
        } catch {
          // Ignore malformed payloads — polling keeps us correct.
        }
      });

      socket.addEventListener("close", () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, 5000);
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [wsUrl, scope.kind, scope.id, swr]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    lastEvent,
    refresh: () => {
      void swr.mutate();
    },
  };
}
