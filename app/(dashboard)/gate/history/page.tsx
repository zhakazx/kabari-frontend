import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { getCheckInsByEvent } from "@/lib/dal-penerima-tamu";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { LiveGateHistory } from "@/components/gate/LiveGateHistory";
import { EventIdEntry } from "@/components/gate/EventIdEntry";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconArrowRight, IconClipboardCheck } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Riwayat Check-in",
  description: "Daftar tamu yang sudah melakukan check-in di gerbang.",
};

type SearchParams = Promise<{
  eventId?: string | string[];
}>;

function readEventId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function GateHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const eventId = readEventId(params.eventId);

  if (!eventId) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={<IconClipboardCheck size={22} />}
              title="Pilih acara untuk melihat riwayat"
              description={
                "Tempel ID acara (UUID) dari penyelenggara. Backend belum " +
                "menyediakan daftar acara untuk peran penerima tamu — masukkan " +
                "ID secara manual untuk sementara."
              }
            />
            <div className="mt-6">
              <EventIdEntry />
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-foreground/50">
          Ingin memindai QR lagi?{" "}
          <Link href="/gate" className="text-accent hover:underline">
            Kembali ke pemindai
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />
      <Suspense fallback={<HistoryFallback />}>
        <HistoryBody eventId={eventId} />
      </Suspense>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
        Riwayat
      </p>
      <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
        Check-in hari ini
      </h1>
      <p className="max-w-2xl text-sm text-foreground/65">
        Daftar tamu yang sudah tercatat di gerbang. Daftar ini akan
        diperbarui otomatis setiap beberapa detik.
      </p>
    </div>
  );
}

async function HistoryBody({ eventId }: { eventId: string }) {
  const session = await requireRole("penerima_tamu");
  const { items } = await getCheckInsByEvent(session, eventId, { page: 1, limit: 20 });
  return (
    <div className="flex flex-col gap-6">
      <EventIdEntry initialValue={eventId} />
      <LiveGateHistory eventId={eventId} initial={items} />
      <p className="text-xs text-foreground/50">
        Butuh melihat acara lain?{" "}
        <Link
          href="/gate/history"
          className="text-accent hover:underline"
        >
          Ganti ID acara
        </Link>
        {" "}atau kembali ke{" "}
        <Link href="/gate" className="text-accent hover:underline">
          pemindai
          <IconArrowRight size={11} className="ml-0.5 inline" />
        </Link>
        .
      </p>
    </div>
  );
}

function HistoryFallback() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <SkeletonText lines={4} />
        </CardContent>
      </Card>
    </div>
  );
}
