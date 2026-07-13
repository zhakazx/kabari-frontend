import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getOrder } from "@/lib/dal-pelanggan";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDateTime,
  formatRupiah,
  statusBadgeVariant,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PaymentPanel } from "@/components/orders/PaymentPanel";
import { OrderStatusPoller } from "@/components/orders/OrderStatusPoller";
import { IconArrowRight } from "@/components/ui/icons";
import type { Order, Payment, PaymentMethod, OrderStatus, PaymentStatus } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const order = await getOrder(session, id);
  if (!order) notFound();

  const isPending = order.status === "pending";
  const latest = order.payments?.[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-foreground/55">
        <Link href="/orders" className="hover:text-foreground/80">
          Pesanan
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span>{" "}
        <span className="text-foreground/80">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(order.status)} dot>
              {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
            </Badge>
            {order.event ? (
              <span className="text-sm text-foreground/65">
                · {order.event.event_name}
              </span>
            ) : null}
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Pesanan #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-foreground/65">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <span className="block text-xs text-foreground/55">Total</span>
          <span className="font-display text-2xl font-medium tracking-tight text-foreground">
            {formatRupiah(order.total_amount)}
          </span>
        </div>
      </div>

      <OrderStatusPoller orderId={order.id} status={order.status} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <OrderSummaryCard order={order} latest={latest} />

        {isPending ? (
          <Card>
            <CardHeader>
              <CardTitle>Bayar sekarang</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentPanel orderId={order.id} amount={Number(order.total_amount)} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments && order.payments.length > 0 ? (
                <PaymentHistory payments={order.payments} />
              ) : (
                <p className="text-sm text-foreground/55">
                  Belum ada pembayaran.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-foreground/50">
        Butuh bantuan?{" "}
        <Link
          href="/notifications"
          className="text-accent hover:underline"
        >
          Lihat notifikasi
        </Link>{" "}
        atau hubungi tim KABARI.
      </p>
    </div>
  );
}

function OrderSummaryCard({
  order,
  latest,
}: {
  order: Order;
  latest: Payment | null | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail pesanan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Acara
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {order.event?.event_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Metode pilihan
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {order.preferred_payment_method
                ? PAYMENT_METHOD_LABELS[order.preferred_payment_method as PaymentMethod]
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Total
            </dt>
            <dd className="mt-1 font-medium text-foreground">
              {formatRupiah(order.total_amount)}
            </dd>
          </div>
        </dl>
        {latest ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground/65">Pembayaran terakhir</span>
              <Badge variant={statusBadgeVariant(latest.status)} dot>
                {PAYMENT_STATUS_LABELS[latest.status as PaymentStatus] ??
                  latest.status}
              </Badge>
            </div>
            <span className="text-xs text-foreground/55">
              Invoice {latest.invoice_number} · {formatDateTime(latest.created_at)}
            </span>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {order.event ? (
            <Button href={`/events/${order.event.id}`} variant="outline" size="sm">
              <IconArrowRight size={14} />
              Buka acara
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {payments.map((p) => (
        <li
          key={p.id}
          className="flex flex-col gap-1.5 rounded-md border border-border bg-surface px-3 py-2.5 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {formatRupiah(p.amount)}
            </span>
            <Badge variant={statusBadgeVariant(p.status)} dot>
              {PAYMENT_STATUS_LABELS[p.status as PaymentStatus] ?? p.status}
            </Badge>
          </div>
          <span className="text-xs text-foreground/55">
            {PAYMENT_METHOD_LABELS[p.payment_method as PaymentMethod] ??
              p.payment_method}{" "}
            · Invoice {p.invoice_number} · {formatDateTime(p.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
