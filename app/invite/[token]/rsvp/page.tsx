import { Suspense } from "react";

import { getInvitationByToken } from "@/lib/dal-public";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RsvpForm } from "./_components/RsvpForm";

export default async function RsvpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<RsvpShellFallback />}>
        {params.then(({ token }) => (
          <RsvpBody token={token} />
        ))}
      </Suspense>
    </main>
  );
}

async function RsvpBody({ token }: { token: string }) {
  const result = await getInvitationByToken(token);
  if (!result.ok) {
    return (
      <ErrorState
        title={
          result.error === "not_found"
            ? "Undangan tidak ditemukan"
            : result.error === "inactive"
              ? "Acara belum aktif"
              : "Terjadi kesalahan"
        }
        description={
          result.error === "inactive"
            ? "Konfirmasi belum dapat dilakukan karena acara belum aktif."
            : "Tautan yang Anda buka mungkin sudah tidak berlaku."
        }
      />
    );
  }

  const invitation = result.invitation;
  const event = invitation.event;
  const initialStatus = invitation.rsvp_status;
  const initialCount = invitation.jumlah_hadir || 1;

  return (
    <div className="flex flex-col gap-6">
      <Button
        href={`/invite/${token}`}
        variant="ghost"
        size="sm"
        className="self-start"
      >
        ← Kembali ke undangan
      </Button>

      <header className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
          Konfirmasi Kehadiran
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {event?.event_name ?? "Undangan"}
        </h1>
        {event ? (
          <p className="text-sm text-foreground/65">
            {formatDateTime(event.event_date)} · {event.venue_name}
          </p>
        ) : null}
      </header>

      <RsvpForm
        token={token}
        guestName={invitation.tamu_name}
        initialStatus={initialStatus}
        initialCount={initialCount}
      />
    </div>
  );
}

function RsvpShellFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-3 w-32 animate-pulse rounded bg-surface-muted" />
      <div className="h-9 w-3/4 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-72 w-full animate-pulse rounded-xl bg-surface-muted" />
    </div>
  );
}
