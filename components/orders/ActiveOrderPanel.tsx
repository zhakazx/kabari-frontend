import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IconClock, IconReceipt } from "@/components/ui/icons";
import {
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatRupiah,
  statusBadgeVariant,
} from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

/**
 * Prominent callout for the event's currently active order. Replaces the
 * "Buat pesanan baru" form once an order exists, so the customer doesn't
 * think they can place another one. The `pending` branch guides them to
 * pay; the `paid` branch shows the active order summary.
 */
export function ActiveOrderPanel({ order }: { order: Order }) {
  const isPending = order.status === "pending";
  const title = isPending ? "Selesaikan pembayaran" : "Pesanan aktif";
  const MetaIcon = isPending ? IconClock : IconReceipt;

  return (
    <Card className={isPending ? "border-warning/30" : undefined}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge variant={statusBadgeVariant(order.status)} dot>
            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Total
            </span>
            <span className="font-display text-xl font-medium tracking-tight text-foreground">
              {formatRupiah(order.total_amount)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground/55">
          <MetaIcon size={14} className="text-foreground/40" />
          <span>
            Pesanan #{order.id.slice(0, 8)} · dibuat{" "}
            {formatDateTime(order.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3 text-sm">
          {isPending ? (
            <span className="mr-auto text-xs text-foreground/55">
              Selesaikan pembayaran untuk mengaktifkan pesanan.
            </span>
          ) : null}
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {isPending ? "Bayar sekarang" : "Lihat detail pesanan"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
