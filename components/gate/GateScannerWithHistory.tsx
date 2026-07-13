"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/Card";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { GateAuditStrip } from "@/components/gate/GateAuditStrip";
import { LiveGateHistory } from "@/components/gate/LiveGateHistory";
import { QrScannerClient } from "@/components/gate/QrScannerClient";
import { IconClipboardCheck } from "@/components/ui/icons";
import type { CheckInResult } from "@/lib/types";

/**
 * Unified gate view. The scanner and the live "recently checked in" list
 * live on the same page so the operator never has to navigate away to see
 * who has already been scanned.
 *
 * The event is discovered from the first scan's `CheckInResult` — no
 * manual UUID entry. Once `event_id` comes back non-empty, the audit
 * strip shows the event name and the live history panel starts polling.
 * Until then, a placeholder explains the flow.
 */
export function GateScannerWithHistory({
  operatorName,
}: {
  operatorName: string;
}) {
  const [event, setEvent] = useState<{ id: string; name: string } | null>(null);

  const handleEventResolved = (result: CheckInResult) => {
    if (!result.event_id) return;
    setEvent((prev) => prev ?? { id: result.event_id, name: result.event_name });
  };

  return (
    <div className="flex flex-col gap-4">
      <GateAuditStrip operatorName={operatorName} event={event} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col gap-4">
          <QrScannerClient
            operatorName={operatorName}
            onEventResolved={handleEventResolved}
          />
          <Card>
            <CardContent className="flex items-start gap-3 p-4 text-sm text-foreground/70">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <IconClipboardCheck size={15} />
              </span>
              <p>
                QR tidak bisa terbaca? Buka bagian{" "}
                <span className="font-medium text-foreground/85">
                  Input manual token
                </span>{" "}
                di bawah viewfinder untuk menempelkan tautan undangan secara
                langsung.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          {event ? (
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
                Sudah check-in
              </h2>
              <LiveBadge />
            </div>
          ) : null}

          {event ? (
            <LiveGateHistory eventId={event.id} initial={[]} />
          ) : (
            <EventPendingPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function EventPendingPlaceholder() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <IconClipboardCheck size={22} />
        </span>
        <div className="flex max-w-sm flex-col gap-1.5">
          <p className="font-display text-lg font-medium text-foreground">
            Daftar tamu muncul setelah scan pertama
          </p>
          <p className="text-sm text-foreground/65">
            Pindai QR tamu untuk memulai. Acara terdeteksi otomatis dari
            undangan, dan daftar kehadiran langsung akan tampil di sini.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
