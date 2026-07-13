import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { getMyEvents, getMyOrders } from "@/lib/dal-pelanggan";
import type { PelangganEventsQuery } from "@/lib/dal-pelanggan";
import {
  EVENT_STATUS_LABELS,
  formatDate,
  formatRupiah,
  statusBadgeVariant,
  toNumber,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";
import { IconArrowRight, IconCalendar, IconPlus } from "@/components/ui/icons";

const PAGE_SIZE = 20;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("pelanggan");
  const params = await searchParams;
  const page = parsePage(params.page);

  const query: PelangganEventsQuery = { page, limit: PAGE_SIZE };
  const { items: events, meta, counts } = await getMyEvents(session, query);

  // Fetch all orders for accurate total spent — lightweight call
  const { items: allOrders } = await getMyOrders(session, { limit: 100 });

  if (events.length === 0 && page === 1) {
    return (
      <EmptyState
        icon={<IconCalendar size={22} />}
        title="Belum ada acara"
        description="Buat acara pertama Anda — pilih template, isi detail, dan undang tamu dalam hitungan menit."
        action={
          <Button href="/events/new" size="md">
            <IconPlus size={16} />
            Buat acara
          </Button>
        }
      />
    );
  }

  const allSpent = allOrders
    .filter((o) => o.status === "paid")
    .reduce((acc, o) => acc + toNumber(o.total_amount), 0);
  const allUnpaid = allOrders.filter((o) => o.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
            Acara
          </p>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Daftar acara Anda
          </h1>
          <p className="text-sm text-foreground/65">
            Kelola detail, tamu, dan pembayaran untuk setiap acara.
          </p>
        </div>
        <Button href="/events/new" size="md">
          <IconPlus size={16} />
          Buat acara
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total acara"
          value={meta.total.toLocaleString("id-ID")}
          hint="Sepanjang waktu"
        />
        <SummaryCard
          label="Sedang aktif"
          value={counts.active.toLocaleString("id-ID")}
          hint="Status aktif"
        />
        <SummaryCard
          label="Draft"
          value={counts.draft.toLocaleString("id-ID")}
          hint="Belum dibayar"
        />
        <SummaryCard
          label="Pesanan belum dibayar"
          value={allUnpaid.toLocaleString("id-ID")}
          hint={
            allUnpaid > 0 ? (
              <Link
                href="/orders"
                className="text-accent hover:underline"
              >
                Lihat pesanan
              </Link>
            ) : (
              "—"
            )
          }
        />
      </div>

      <EventsTable events={events} />

      {meta.total_pages > 1 && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-foreground/55">
            {meta.total} acara · halaman {meta.page} dari {meta.total_pages}
          </p>
          <Pagination
            page={page}
            totalPages={meta.total_pages}
            searchParams={params}
          />
        </div>
      )}

      <p className="text-xs text-foreground/50">
        Total pembayaran yang sudah lunas: {formatRupiah(allSpent)}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-5">
        <span className="text-sm text-foreground/65">{label}</span>
        <span className="font-display text-2xl font-medium tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-xs text-foreground/55">{hint}</span>
      </CardContent>
    </Card>
  );
}

function EventsTable({
  events,
}: {
  events: Awaited<ReturnType<typeof getMyEvents>>["items"];
}) {
  if (events.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Table>
        <THead>
          <TR>
            <TH>Nama</TH>
            <TH className="hidden sm:table-cell">Tanggal</TH>
            <TH className="hidden md:table-cell">Tempat</TH>
            <TH>Template</TH>
            <TH>Status</TH>
            <TH className="text-right">Aksi</TH>
          </TR>
        </THead>
        <TBody>
          {events.map((event) => (
            <TR key={event.id}>
              <TD>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {event.event_name}
                  </span>
                  <span className="text-xs text-foreground/55 sm:hidden">
                    {formatDate(event.event_date)} · {event.venue_name}
                  </span>
                </div>
              </TD>
              <TD className="hidden sm:table-cell">
                <span className="text-sm text-foreground/80">
                  {formatDate(event.event_date)}
                </span>
              </TD>
              <TD className="hidden md:table-cell">
                <span className="text-sm text-foreground/75">
                  {event.venue_name}
                </span>
              </TD>
              <TD>
                {event.template?.name ? (
                  <span className="text-sm text-foreground/75">
                    {event.template.name}
                  </span>
                ) : (
                  <span className="text-xs text-foreground/45">—</span>
                )}
              </TD>
              <TD>
                <Badge variant={statusBadgeVariant(event.status)} dot>
                  {EVENT_STATUS_LABELS[event.status]}
                </Badge>
              </TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    href={`/events/${event.id}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                  >
                    Lihat
                    <IconArrowRight size={14} />
                  </Button>
                  <DeleteEventButton
                    eventId={event.id}
                    eventName={event.event_name}
                  />
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
