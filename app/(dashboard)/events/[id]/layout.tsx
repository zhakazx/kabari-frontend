import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { getEvent } from "@/lib/dal-pelanggan";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventTabs } from "@/components/events/EventTabs";
import {
  EVENT_STATUS_LABELS,
  formatDateTime,
  statusBadgeVariant,
} from "@/lib/utils";

/**
 * Sub-layout shared by all `/events/[id]/...` pages. Renders the page
 * header, status pill, sub-nav, and an early "not owner" wall if the
 * viewer is not the event owner. Children render below the tabs.
 */
export default async function EventSubLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);

  if (!event) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="font-display text-lg font-medium text-foreground">
            Acara tidak ditemukan
          </p>
          <p className="text-sm text-foreground/65">
            Acara ini mungkin sudah dihapus atau belum pernah dibuat.
          </p>
          <Button href="/events" size="sm" className="mt-2">
            Kembali ke daftar acara
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (event.pelanggan_id !== session.userId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="font-display text-lg font-medium text-foreground">
            Anda tidak memiliki akses ke acara ini
          </p>
          <p className="text-sm text-foreground/65">
            Silakan kembali ke daftar acara Anda.
          </p>
          <Button href="/events" size="sm" className="mt-2">
            Kembali ke acara saya
          </Button>
        </CardContent>
      </Card>
    );
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

      <div className="flex flex-col gap-2">
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
        <p className="text-sm text-foreground/65">
          {formatDateTime(event.event_date)} · {event.venue_name}
        </p>
      </div>

      <EventTabs eventId={event.id} />

      {children}
    </div>
  );
}
