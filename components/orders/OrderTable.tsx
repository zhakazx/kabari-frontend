import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconReceipt } from "@/components/ui/icons";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDate,
  formatRupiah,
  statusBadgeVariant,
} from "@/lib/utils";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

/**
 * Paginated-friendly order history for a pelanggan. The list endpoint
 * already orders by `created_at DESC`, so we render in arrival order.
 */
export function OrderTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<IconReceipt size={22} />}
        title="Belum ada pesanan"
        description="Pesanan Anda akan tampil di sini setelah membuat acara dan memilih paket."
        action={
          <Link
            href="/events"
            className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3.5 text-xs font-medium text-foreground/80 transition hover:bg-surface-muted"
          >
            Pilih acara
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Invoice</TH>
          <TH>Acara</TH>
          <TH>Total</TH>
          <TH>Status</TH>
          <TH>Pembayaran</TH>
          <TH className="text-right">Aksi</TH>
        </TR>
      </THead>
      <TBody>
        {orders.map((o) => {
          const latestPayment = o.payments?.[0];
          return (
            <TR key={o.id}>
              <TD>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-foreground/75">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-foreground/55">
                    {formatDate(o.created_at)}
                  </span>
                </div>
              </TD>
              <TD>
                <span className="text-sm text-foreground/85">
                  {o.event?.event_name ?? "—"}
                </span>
              </TD>
              <TD>
                <span className="font-medium text-foreground">
                  {formatRupiah(o.total_amount)}
                </span>
              </TD>
              <TD>
                <Badge variant={statusBadgeVariant(o.status)} dot>
                  {ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                </Badge>
              </TD>
              <TD>
                {latestPayment ? (
                  <Badge
                    variant={statusBadgeVariant(latestPayment.status)}
                    dot
                  >
                    {PAYMENT_STATUS_LABELS[latestPayment.status as PaymentStatus] ??
                      latestPayment.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-foreground/55">Belum ada</span>
                )}
              </TD>
              <TD className="text-right">
                <Link
                  href={`/orders/${o.id}`}
                  className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-foreground/80 transition hover:bg-surface-muted hover:text-foreground"
                >
                  Lihat →
                </Link>
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
