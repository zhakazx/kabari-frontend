import { Suspense } from "react";

import { getInvitationByToken, getInvitationQrCode } from "@/lib/dal-public";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconArrowRight, IconQr } from "@/components/ui/icons";
import { QrCard } from "./_components/QrCard";

export default async function InvitationQrPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<QrShellFallback />}>
        {params.then(({ token }) => (
          <QrBody token={token} />
        ))}
      </Suspense>
    </main>
  );
}

async function QrBody({ token }: { token: string }) {
  const [invitation, qr] = await Promise.all([
    getInvitationByToken(token),
    getInvitationQrCode(token),
  ]);

  if (!invitation.ok) {
    return (
      <ErrorState
        title={
          invitation.error === "not_found"
            ? "Undangan tidak ditemukan"
            : invitation.error === "inactive"
              ? "Acara belum aktif"
              : "Terjadi kesalahan"
        }
        description="QR code belum dapat ditampilkan."
      />
    );
  }

  if (!qr.ok) {
    return (
      <ErrorState
        title="QR code tidak tersedia"
        description="Coba segarkan halaman ini. Jika masalah berlanjut, hubungi penyelenggara."
      />
    );
  }

  const guestName = invitation.invitation.tamu_name;
  const event = invitation.invitation.event;

  return (
    <div className="flex flex-col gap-6 text-center">
      <header className="flex flex-col items-center gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
          <IconQr size={20} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
          QR Code Pribadi
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {guestName}
        </h1>
        {event ? (
          <p className="text-sm text-foreground/65">{event.event_name}</p>
        ) : null}
      </header>

      <QrCard dataUrl={qr.dataUrl} token={token} />

      <p className="text-sm text-foreground/65">
        Tunjukkan QR ini di gerbang untuk absen masuk acara. Penyelenggara
        akan memindainya dan menandai Anda hadir.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button href={`/invite/${token}`} variant="outline" size="sm">
          Kembali ke undangan
        </Button>
        <Button
          href={`/invite/${token}/rsvp`}
          variant="ghost"
          size="sm"
        >
          Ubah RSVP
          <IconArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function QrShellFallback() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
      <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-80 w-80 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  );
}
