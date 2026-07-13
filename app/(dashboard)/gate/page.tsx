import { Suspense } from "react";
import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { Skeleton } from "@/components/ui/Skeleton";
import { GateScannerWithHistory } from "@/components/gate/GateScannerWithHistory";

export const metadata: Metadata = {
  title: "Pindai Gerbang",
  description: "Pindai QR tamu dan catat kehadiran di gerbang acara.",
};

export default function GateScanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Gerbang
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Pindai QR tamu
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Arahkan kamera ke QR code pada undangan tamu. Sistem akan
          menampilkan status kehadiran dan otomatis kembali siap menerima
          tamu berikutnya. Daftar tamu yang sudah check-in tampil di samping.
        </p>
      </div>

      <Suspense fallback={<ScannerFallback />}>
        <ScannerIsland />
      </Suspense>
    </div>
  );
}

async function ScannerIsland() {
  const session = await requireRole("penerima_tamu");
  return <GateScannerWithHistory operatorName={session.name} />;
}

function ScannerFallback() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] w-full">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
