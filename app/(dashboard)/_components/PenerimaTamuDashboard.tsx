import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  IconArrowRight,
  IconCamera,
  IconClipboardCheck,
  IconQr,
  IconScan,
  IconUserCheck,
} from "@/components/ui/icons";

import { DashboardHeader } from "./DashboardHeader";

/**
 * Gate scanner (penerima tamu) dashboard. This role's data is event-scoped
 * (each scan attaches to one event), so the dashboard is centred on the
 * scanner workflow itself — a launchpad to the camera view, a quick how-it-
 * works, and a link to the check-in history.
 */
export function PenerimaTamuDashboard({ session }: { session: Session }) {
  const firstName = session.name.split(" ")[0] ?? session.name;
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={session.name}
        role="penerima_tamu"
        eyebrow="Beranda"
        title={`Halo, ${firstName}`}
        description="Pindai QR code tamu di gerbang acara untuk menandai kehadiran."
      />

      <section
        aria-label="Mulai pindai"
        className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
      >
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-accent-soft via-surface to-surface-muted p-6 sm:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
                  <IconScan size={20} />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
                    Pemindai
                  </span>
                  <span className="text-sm font-medium text-foreground/80">
                    Siap menerima QR code
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  Buka pemindai untuk memulai
                </h2>
                <p className="max-w-md text-sm text-foreground/65">
                  Arahkan kamera ke QR code pada undangan tamu. Sistem akan
                  otomatis menandai tamu hadir dan mencatat check-in.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button href="/gate" size="lg">
                  <IconScan size={16} />
                  Mulai pindai
                </Button>
                <Button href="/gate/history" variant="outline" size="lg">
                  Riwayat check-in
                  <IconArrowRight size={14} />
                </Button>
              </div>
            </div>
            <ScanDecor />
          </div>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/55">
              Status pemindai
            </span>
            <div className="flex items-center gap-3">
              <span className="relative inline-flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
              </span>
              <span className="font-medium text-foreground">Aktif</span>
            </div>
            <p className="text-sm text-foreground/65">
              Pemindai siap menerima QR code dari undangan tamu KABARI.
              Pastikan kamera perangkat Anda berfungsi dan cahaya sekitar
              cukup terang.
            </p>
            <div className="mt-auto rounded-md border border-border bg-surface-muted/40 p-3 text-xs text-foreground/60">
              <strong className="font-medium text-foreground/80">Tips:</strong>{" "}
              QR code yang valid hanya menampilkan token dari tautan{" "}
              <code className="rounded bg-surface px-1 py-0.5 font-mono">
                /invite/&lt;token&gt;
              </code>{" "}
              yang diterbitkan oleh platform.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Cara kerja
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Step
            number={1}
            title="Buka pemindai"
            description="Klik Mulai pindai di atas. Browser akan meminta akses kamera — izinkan sekali per perangkat."
            icon={<IconCamera size={18} />}
          />
          <Step
            number={2}
            title="Arahkan ke QR code"
            description="Pegang kamera 15–25 cm dari QR code pada undangan. Bingkai pemindai akan menandai token terbaca."
            icon={<IconQr size={18} />}
          />
          <Step
            number={3}
            title="Selesai"
            description="Sistem otomatis menandai tamu hadir. Hasil pindai dan pesan kesalahan tampil di layar yang sama."
            icon={<IconUserCheck size={18} />}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Setelah pemindaian
        </h2>
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
              <IconClipboardCheck size={20} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-medium text-foreground">
                Riwayat check-in
              </span>
              <p className="text-sm text-foreground/65">
                Lihat daftar tamu yang sudah Anda pindai. Riwayat disimpan
                per perangkat untuk membantu audit di gerbang.
              </p>
            </div>
            <Button href="/gate/history" variant="outline" size="sm">
              Buka riwayat
              <IconArrowRight size={14} />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
            {number}
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-muted text-foreground/65">
            {icon}
          </span>
        </div>
        <span className="font-medium text-foreground">{title}</span>
        <p className="text-sm text-foreground/65">{description}</p>
      </CardContent>
    </Card>
  );
}

function ScanDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block"
    >
      <svg
        viewBox="0 0 240 240"
        className="absolute right-6 top-1/2 h-56 w-56 -translate-y-1/2 text-accent/30"
      >
        <rect
          x="20"
          y="20"
          width="200"
          height="200"
          rx="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        <rect
          x="60"
          y="60"
          width="120"
          height="120"
          rx="10"
          fill="currentColor"
          opacity="0.18"
        />
        <line
          x1="40"
          y1="120"
          x2="200"
          y2="120"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
