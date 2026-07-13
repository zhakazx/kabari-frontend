import Link from "next/link";

import {
  getMyEvents,
  getMyOrders,
  getNotifications,
} from "@/lib/dal-pelanggan";
import {
  EVENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatRupiah,
  statusBadgeVariant,
  toNumber,
} from "@/lib/utils";
import type { Event, Order, Session } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconInbox,
  IconPlus,
  IconReceipt,
  IconUserCheck,
  IconUsers,
} from "@/components/ui/icons";

import { DashboardHeader } from "./DashboardHeader";
import { StatTile } from "./StatTile";

/**
 * Pelanggan (event organiser) dashboard. Aggregates events, orders, and
 * notifications into a glanceable overview, then surfaces the things that
 * need attention first.
 */
export async function PelangganDashboard({ session }: { session: Session }) {
  const [{ items: events }, { items: orders }, { items: notifications }] = await Promise.all([
    getMyEvents(session, { limit: 50 }),
    getMyOrders(session, { limit: 50 }),
    getNotifications(session, { limit: 50 }).catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 50, total_pages: 0 } })),
  ]);

  // Server-rendered once per request; `Date.now()` is the request time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcomingEvents = events
    .filter((e) => new Date(e.event_date).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    )
    .slice(0, 5);

  const recentOrders = orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalPaid = paidOrders.reduce(
    (acc, o) => acc + toNumber(o.total_amount),
    0,
  );
  const unpaidAmount = pendingOrders.reduce(
    (acc, o) => acc + toNumber(o.total_amount),
    0,
  );

  const eventsWithPending: { event: Event; order: Order }[] = pendingOrders
    .map((o) => (o.event ? { event: o.event, order: o } : null))
    .filter((v): v is { event: Event; order: Order } => v !== null)
    .reduce(
      (acc, v) =>
        acc.find((x) => x.event.id === v.event.id) ? acc : [...acc, v],
      [] as { event: Event; order: Order }[],
    );

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={session.name}
        role="pelanggan"
        eyebrow="Beranda"
        title={`Halo, ${session.name.split(" ")[0] ?? session.name}`}
        description="Ringkasan acara, pesanan, dan aktivitas terbaru Anda."
      />

      <section
        aria-label="Ringkasan"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatTile
          label="Total acara"
          value={events.length}
          icon={<IconCalendar size={16} />}
          hint={
            upcomingEvents.length > 0
              ? `${upcomingEvents.length} akan datang`
              : "Belum ada acara"
          }
          href="/events"
        />
        <StatTile
          label="Pesanan belum dibayar"
          value={pendingOrders.length}
          icon={<IconReceipt size={16} />}
          tone={pendingOrders.length > 0 ? "warning" : "neutral"}
          hint={
            pendingOrders.length > 0
              ? `Total ${formatRupiah(unpaidAmount)}`
              : "Tidak ada tagihan aktif"
          }
          href="/orders"
        />
        <StatTile
          label="Sudah dibayar"
          value={paidOrders.length}
          icon={<IconUserCheck size={16} />}
          tone="success"
          hint={formatRupiah(totalPaid)}
        />
        <StatTile
          label="Notifikasi"
          value={notifications.length}
          icon={<IconInbox size={16} />}
          tone="info"
          href="/notifications"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <SectionHeader
            title="Acara terdekat"
            actionHref="/events"
            actionLabel="Lihat semua"
          />
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<IconCalendar size={22} />}
              title="Belum ada acara mendatang"
              description="Buat acara baru untuk mulai mengelola tamu dan pesanan."
              action={
                <Button href="/events/new" size="sm">
                  <IconPlus size={14} />
                  Buat acara
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Pesanan terbaru"
            actionHref="/orders"
            actionLabel="Riwayat"
          />
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<IconReceipt size={22} />}
              title="Belum ada pesanan"
              description="Pesanan akan tampil di sini setelah Anda membuat acara."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {eventsWithPending.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Perlu perhatian"
            description="Acara dengan pesanan yang belum dibayar akan otomatis nonaktif."
          />
          <ul className="flex flex-col gap-3">
            {eventsWithPending.map(({ event, order }) => (
              <PendingAttentionRow
                key={event.id}
                event={event}
                order={order}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-xs text-foreground/55">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="text-xs font-medium text-accent hover:underline"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  return (
    <li>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">
                {event.event_name}
              </span>
              <Badge variant={statusBadgeVariant(event.status)} dot>
                {EVENT_STATUS_LABELS[event.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-foreground/55">
              <span className="inline-flex items-center gap-1">
                <IconCalendar size={12} />
                {formatDateTime(event.event_date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconUsers size={12} />
                {event.venue_name}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              href={`/events/${event.id}/dashboard`}
              variant="outline"
              size="sm"
            >
              Dasbor
            </Button>
            <Button
              href={`/events/${event.id}/orders`}
              variant="outline"
              size="sm"
            >
              Pesanan
            </Button>
            <Button href={`/events/${event.id}`} variant="ghost" size="sm">
              <IconArrowRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function OrderRow({ order }: { order: Order }) {
  const isPending = order.status === "pending";
  return (
    <li>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-foreground/65">
                #{order.id.slice(0, 8)}
              </span>
              <Badge variant={statusBadgeVariant(order.status)} dot>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-foreground/55">
              <span>{order.event?.event_name ?? "Tanpa acara"}</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-medium text-foreground">
              {formatRupiah(order.total_amount)}
            </span>
            {isPending ? (
              <Button href={`/orders/${order.id}`} size="sm">
                Bayar
              </Button>
            ) : (
              <Button
                href={`/orders/${order.id}`}
                variant="outline"
                size="sm"
              >
                Lihat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function PendingAttentionRow({
  event,
  order,
}: {
  event: Event;
  order: Order;
}) {
  return (
    <li>
      <Card className="border-warning/30 bg-warning-soft/30">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-warning-soft text-warning">
                <IconClock size={14} />
              </span>
              <span className="font-medium text-foreground">
                {event.event_name}
              </span>
            </div>
            <p className="text-xs text-foreground/65">
              Selesaikan pembayaran {formatRupiah(order.total_amount)} untuk
              mengaktifkan acara.
            </p>
          </div>
          <Button href={`/orders/${order.id}`} size="sm">
            Selesaikan pembayaran
          </Button>
        </CardContent>
      </Card>
    </li>
  );
}
