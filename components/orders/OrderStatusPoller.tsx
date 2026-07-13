"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Polls the order detail page once the order is `pending` to catch the
 * mock webhook's flip to `paid`. We use `router.refresh()` instead of a
 * fetch because the server-rendered table already carries the latest
 * status — and revalidating the route is exactly what `refresh()` does.
 *
 * The interval stops as soon as the parent passes a non-pending status
 * (the server-rendered `status` prop). The effect is keyed on `status`
 * so we don't keep refreshing once payment is confirmed.
 */
export function OrderStatusPoller({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const isPending = status === "pending";

  useEffect(() => {
    if (!isPending) return;
    const start = Date.now();
    const tick = window.setInterval(() => {
      if (Date.now() - start > 60_000) {
        window.clearInterval(tick);
        return;
      }
      router.refresh();
    }, 5000);
    return () => window.clearInterval(tick);
  }, [isPending, router]);

  if (!isPending) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning-soft/40 px-4 py-3 text-sm text-foreground/85">
      <div className="flex items-center gap-2">
        <Spinner size={14} className="text-warning" />
        <span>
          Menunggu konfirmasi pembayaran… Halaman ini akan diperbarui otomatis.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        href={`/orders/${orderId}`}
        onClick={() => router.refresh()}
      >
        Cek sekarang
      </Button>
    </div>
  );
}
