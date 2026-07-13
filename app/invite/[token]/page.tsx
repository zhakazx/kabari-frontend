import { Suspense } from "react";
import type { Metadata } from "next";

import { getInvitationByToken } from "@/lib/dal-public";
import { toNumber } from "@/lib/utils";
import type { Invitation } from "@/lib/types";
import { EventHero } from "@/components/events/EventHero";
import { Gallery } from "@/components/shared/Gallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconCheck, IconQr, IconUserCheck, IconUsers } from "@/components/ui/icons";

type SearchParams = Promise<{ rsvp?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const result = await getInvitationByToken(token);
  if (!result.ok || !result.invitation.event) {
    return { title: "Undangan tidak ditemukan", robots: { index: false } };
  }
  const event = result.invitation.event;
  const description = `${event.event_name} — ${event.venue_name}, ${new Date(
    event.event_date,
  ).toLocaleDateString("id-ID", { dateStyle: "long" })}.`;
  return {
    title: `Undangan: ${event.event_name}`,
    description,
    openGraph: {
      title: event.event_name,
      description,
      type: "website",
    },
  };
}

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<InvitationShellFallback />}>
        {params.then(({ token }) => (
          <InvitationBody token={token} searchParams={searchParams} />
        ))}
      </Suspense>
    </main>
  );
}

async function InvitationBody({
  token,
  searchParams,
}: {
  token: string;
  searchParams: SearchParams;
}) {
  const { rsvp: rsvpFlag } = await searchParams;
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
          result.error === "not_found"
            ? "Tautan yang Anda buka mungkin sudah tidak berlaku. Hubungi penyelengara untuk tautan baru."
            : result.error === "inactive"
              ? "Acara belum dipublikasikan. Silakan kembali lagi nanti."
              : "Maaf, kami tidak dapat memuat undangan Anda saat ini."
        }
      />
    );
  }

  const invitation = result.invitation;
  const event = invitation.event;

  if (!event) {
    return (
      <ErrorState
        title="Undangan tidak lengkap"
        description="Detail acara untuk undangan ini belum tersedia."
      />
    );
  }

  const galleryUrls = parseGalleryUrls(event.gallery_urls);

  return (
    <div className="flex flex-col gap-8">
      {rsvpFlag === "done" ? <ThankYouBanner /> : null}

      <InvitationHeader invitation={invitation} />

      <EventHero event={event} />

      <RsvpStatusCard invitation={invitation} token={token} />

      {galleryUrls.length > 0 ? (
        <section aria-labelledby="galeri" className="flex flex-col gap-3">
          <h2
            id="galeri"
            className="font-display text-xl font-medium tracking-tight"
          >
            Galeri acara
          </h2>
          <Gallery urls={galleryUrls} alt={`Galeri ${event.event_name}`} />
        </section>
      ) : null}
    </div>
  );
}

function parseGalleryUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // fall through — treat raw as a single URL
  }
  return raw ? [raw] : [];
}

function InvitationHeader({ invitation }: { invitation: Invitation }) {
  return (
    <header className="flex flex-col gap-2 text-center sm:text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
        Untuk
      </p>
      <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
        {invitation.tamu_name}
      </h1>
      {invitation.tamu_phone ? (
        <p className="text-xs text-foreground/55">{invitation.tamu_phone}</p>
      ) : null}
    </header>
  );
}

function ThankYouBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-success/25 bg-success-soft px-4 py-3 text-sm text-success"
    >
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
        <IconCheck size={12} />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">Terima kasih, kabar Anda sudah kami terima.</span>
        <span className="text-success/80">
          Penyelenggara acara akan melihat konfirmasi Anda secara langsung.
        </span>
      </div>
    </div>
  );
}

function RsvpStatusCard({
  invitation,
  token,
}: {
  invitation: Invitation;
  token: string;
}) {
  const rsvpLabel = labelForRsvp(invitation.rsvp_status);
  const variant = variantForRsvp(invitation.rsvp_status);
  const isPending = invitation.rsvp_status === "pending";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Status konfirmasi</CardTitle>
          <Badge variant={variant} dot>
            {rsvpLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface-muted/60 px-4 py-3 text-sm">
          <IconUsers size={18} className="text-foreground/55" />
          <div className="flex flex-col">
            <span className="text-foreground/70">Jumlah hadir</span>
            <span className="font-medium text-foreground">
              {attendeeCountText(invitation)}
            </span>
          </div>
        </div>

        <p className="text-sm text-foreground/65">
          {isPending
            ? "Mohon konfirmasi kehadiran Anda agar penyelenggara dapat menyiapkan tempat."
            : "Anda dapat memperbarui konfirmasi atau melihat QR code pribadi Anda."}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            href={`/invite/${token}/rsvp`}
            variant={isPending ? "primary" : "outline"}
            size="sm"
            className="w-full sm:w-auto"
          >
            <IconUserCheck size={14} />
            {isPending ? "Konfirmasi kehadiran" : "Ubah RSVP"}
          </Button>
          <Button
            href={`/invite/${token}/qr`}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <IconQr size={14} />
            Lihat QR code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function labelForRsvp(status: Invitation["rsvp_status"]): string {
  switch (status) {
    case "hadir":
      return "Hadir";
    case "tidak_hadir":
      return "Tidak hadir";
    case "pending":
    default:
      return "Menunggu";
  }
}

function attendeeCountText(invitation: Invitation): string {
  switch (invitation.rsvp_status) {
    case "hadir":
      return `${toNumber(invitation.jumlah_hadir)} orang`;
    case "tidak_hadir":
      return "Tidak ada yang hadir";
    case "pending":
    default:
      return "Belum dikonfirmasi";
  }
}

function variantForRsvp(
  status: Invitation["rsvp_status"],
): "success" | "danger" | "warning" {
  switch (status) {
    case "hadir":
      return "success";
    case "tidak_hadir":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
}

function InvitationShellFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-12 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-surface-muted" />
      </div>
      <div className="h-48 w-full animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-40 w-full animate-pulse rounded-xl bg-surface-muted" />
    </div>
  );
}
