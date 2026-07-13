import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getEvent, getMyOrders } from "@/lib/dal-pelanggan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconReceipt } from "@/components/ui/icons";
import { OrderCreateForm } from "@/components/orders/OrderCreateForm";
import { ActiveOrderPanel } from "@/components/orders/ActiveOrderPanel";
import { formatRupiah } from "@/lib/utils";

export default async function EventOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("pelanggan");
  const { id } = await params;
  const event = await getEvent(session, id);
  if (!event) notFound();
  if (event.pelanggan_id !== session.userId) notFound();

  const { items: allOrders } = await getMyOrders(session, { limit: 100 });
  const eventOrders = allOrders.filter((o) => o.event_id === id);
  const activeOrder =
    eventOrders.find((o) => o.status === "pending") ??
    eventOrders.find((o) => o.status === "paid") ??
    null;

  return (
    <div className="flex flex-col gap-6">
      {activeOrder ? (
        <ActiveOrderPanel order={activeOrder} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Buat pesanan baru</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderCreateForm eventId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Pesanan untuk acara ini</CardTitle>
            {activeOrder ? (
              <span className="text-xs text-foreground/55">
                Pesanan terakhir: {formatRupiah(activeOrder.total_amount)} ·{" "}
                {activeOrder.status}
              </span>
            ) : eventOrders[0] ? (
              <span className="text-xs text-foreground/55">
                Pesanan terakhir: {formatRupiah(eventOrders[0].total_amount)} ·{" "}
                {eventOrders[0].status}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {eventOrders.length === 0 ? (
            <p className="text-sm text-foreground/55">
              Belum ada pesanan untuk acara ini. Buat pesanan pertama Anda
              pada formulir di atas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {eventOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {formatRupiah(o.total_amount)}
                    </span>
                    <span className="text-xs text-foreground/55">
                      {o.status}
                    </span>
                  </div>
                  <Button href={`/orders/${o.id}`} variant="outline" size="sm">
                    Lihat
                    <IconReceipt size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
