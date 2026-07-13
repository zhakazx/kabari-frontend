import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent } from "@/lib/dal-pelanggan";
import {
  EVENT_STATUS_LABELS,
  formatDateTime,
  statusBadgeVariant,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";
import { EventStatusForm } from "@/components/events/EventStatusForm";
import { EventTabs } from "@/components/events/EventTabs";
import { IconArrowRight, IconCalendar } from "@/components/ui/icons";
import type { Event } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);
  if (!event) notFound();

  if (event.pelanggan_id !== session.userId) {
    return <NotOwner />;
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-foreground/55">
        <Link href="/events" className="hover:text-foreground/80">
          Acara
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span>{" "}
        <span className="text-foreground/80">{event.event_name}</span>
      </nav>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(event.status)} dot>
            {EVENT_STATUS_LABELS[event.status]}
          </Badge>
          {event.status === "draft" ? (
            <span className="text-xs text-warning">
              · Selesaikan pembayaran untuk mengaktifkan
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {event.event_name}
        </h1>
        <p className="flex items-center gap-2 text-sm text-foreground/65">
          <IconCalendar size={16} className="text-foreground/55" />
          {formatDateTime(event.event_date)} · {event.venue_name}
        </p>
      </div>

      <EventTabs eventId={event.id} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventSummaryCard event={event} />

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <EventStatusForm eventId={event.id} status={event.status} />
            <div className="border-t border-border" />
            <EventForm kind="edit" event={event} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EventSummaryCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Tanggal
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateTime(event.event_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Tempat
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {event.venue_name}
              {event.venue_address ? (
                <span className="block text-xs text-foreground/65">
                  {event.venue_address}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Template
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {event.template?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Peta
            </dt>
            <dd className="mt-1 text-sm">
              {event.maps_url ? (
                <a
                  href={event.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Buka di Maps
                  <IconArrowRight size={12} />
                </a>
              ) : (
                <span className="text-foreground/55">Belum ada tautan</span>
              )}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button href={`/events/${event.id}/guests`} variant="outline" size="sm">
            Kelola tamu
          </Button>
          <Button href={`/events/${event.id}/orders`} variant="outline" size="sm">
            Buat pesanan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotOwner() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="font-display text-lg font-medium text-foreground">
          Anda tidak memiliki akses ke acara ini
        </p>
        <p className="text-sm text-foreground/65">
          Acara ini milik penyelenggara lain. Silakan kembali ke daftar
          acara Anda.
        </p>
        <Button href="/events" size="sm" className="mt-2">
          Kembali ke acara saya
        </Button>
      </CardContent>
    </Card>
  );
}
