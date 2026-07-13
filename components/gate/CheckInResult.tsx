"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { IconClock, IconUserCheck } from "@/components/ui/icons";
import type { CheckInResult as CheckInResultData, CheckInResultStatus } from "@/lib/types";

const TONE: Record<
  CheckInResultStatus,
  {
    sealBg: string;
    sealText: string;
    label: string;
    badgeVariant: "success" | "warning" | "danger";
    headline: string;
  }
> = {
  sukses: {
    sealBg: "bg-success-soft",
    sealText: "text-success",
    label: "Berhasil",
    badgeVariant: "success",
    headline: "Selamat datang!",
  },
  gagal: {
    sealBg: "bg-warning-soft",
    sealText: "text-warning",
    label: "Sudah Check-in",
    badgeVariant: "warning",
    headline: "Tamu sudah tercatat",
  },
  tidak_terdaftar: {
    sealBg: "bg-danger-soft",
    sealText: "text-danger",
    label: "Tidak Terdaftar",
    badgeVariant: "danger",
    headline: "QR tidak dikenal",
  },
};

const REARM_SECONDS = 4;

/**
 * The big ceremonial result card that replaces the camera viewfinder for
 * a few seconds after each scan. The parent passes a `key` based on the
 * result identity so this component remounts cleanly on every new scan;
 * the countdown timer then counts down from `REARM_SECONDS` and calls
 * `onReArm` to release the scanner.
 */
export function CheckInResult({
  result,
  operatorName,
  onReArm,
}: {
  result: CheckInResultData;
  operatorName: string;
  onReArm: () => void;
}) {
  const status: CheckInResultStatus = result.check_in_status ?? "tidak_terdaftar";
  const tone = TONE[status];

  const [secondsLeft, setSecondsLeft] = useState<number>(REARM_SECONDS);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil(REARM_SECONDS - (Date.now() - start) / 1000),
      );
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        onReArm();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [onReArm]);

  const remaining = secondsLeft;

  const showName = result.tamu_name && result.tamu_name.length > 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border-2 bg-surface p-6 text-center",
        status === "sukses" && "border-success/40",
        status === "gagal" && "border-warning/45",
        status === "tidak_terdaftar" && "border-danger/45",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
      >
        <div
          className={cn(
            "h-full w-full",
            status === "sukses" && "text-success",
            status === "gagal" && "text-warning",
            status === "tidak_terdaftar" && "text-danger",
          )}
        >
          <div className="seal-ring h-full w-full text-current" />
        </div>
      </div>

      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-full",
          tone.sealBg,
          tone.sealText,
        )}
      >
        <SealGlyph status={status} />
      </div>

      <div className="relative flex flex-col items-center gap-1.5">
        <Badge variant={tone.badgeVariant} dot>
          {tone.label}
        </Badge>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {tone.headline}
        </h2>
      </div>

      {showName ? (
        <p className="relative max-w-md font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {result.tamu_name}
        </p>
      ) : (
        <p className="relative text-sm text-foreground/65">
          QR terbaca tetapi tidak terkait dengan tamu undangan manapun.
        </p>
      )}

      {result.event_name ? (
        <p className="relative text-sm text-foreground/60">
          Acara: <span className="font-medium text-foreground/85">{result.event_name}</span>
        </p>
      ) : null}

      {result.rsvp_status ? (
        <p className="relative text-sm text-foreground/75">
          RSVP: <span className="font-medium capitalize text-foreground/90">{result.rsvp_status.replace(/_/g, " ")}</span>
        </p>
      ) : null}

      {result.message ? (
        <p className="relative max-w-md text-sm text-foreground/65">
          {result.message}
        </p>
      ) : null}

      <div className="relative mt-2 flex w-full max-w-sm flex-col gap-1.5 border-t border-border pt-4 text-xs text-foreground/55">
        <div className="flex items-center justify-center gap-1.5">
          <IconUserCheck size={13} />
          <span>
            Operator: <span className="font-medium text-foreground/75">{operatorName}</span>
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <IconClock size={13} />
          <AuditTime />
        </div>
        <p className="pt-1 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/40">
          Scanner reaktif dalam {Math.ceil(remaining)} detik
        </p>
      </div>
    </div>
  );
}

function AuditTime() {
  const stamp = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    () => null,
  );
  return (
    <span>
      Waktu:{" "}
      <span className="font-mono text-foreground/75" suppressHydrationWarning>
        {stamp ?? "—"}
      </span>
    </span>
  );
}

let cachedClockStamp: string | null = null;

function getClockSnapshot(): string | null {
  if (cachedClockStamp === null && typeof window !== "undefined") {
    cachedClockStamp = formatStamp(new Date());
  }
  return cachedClockStamp;
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

function SealGlyph({ status }: { status: CheckInResultStatus }) {
  if (status === "sukses") {
    return (
      <svg
        viewBox="0 0 48 48"
        width={56}
        height={56}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M10 24.5 20 34 38 16" />
      </svg>
    );
  }
  if (status === "gagal") {
    return (
      <svg
        viewBox="0 0 48 48"
        width={56}
        height={56}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M16 16l16 16" />
        <path d="M32 16 16 32" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 48 48"
      width={56}
      height={56}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M24 16v10" />
      <path d="M24 33.5h.01" />
    </svg>
  );
}
