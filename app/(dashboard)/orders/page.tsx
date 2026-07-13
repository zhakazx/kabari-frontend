import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { getMyOrders } from "@/lib/dal-pelanggan";
import type { PelangganOrdersQuery } from "@/lib/dal-pelanggan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Pagination } from "@/components/shared/Pagination";
import { OrderTable } from "@/components/orders/OrderTable";

const PAGE_SIZE = 20;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole("pelanggan");
  const params = await searchParams;
  const page = parsePage(params.page);

  const query: PelangganOrdersQuery = { page, limit: PAGE_SIZE };
  const { items: orders, meta, counts } = await getMyOrders(session, query);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
            Pesanan
          </p>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Riwayat pesanan
          </h1>
          <p className="text-sm text-foreground/65">
            Pesanan untuk semua acara Anda tampil di sini.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Total pesanan" value={meta.total} />
        <SummaryTile
          label="Belum dibayar"
          value={counts.pending}
          tone={counts.pending > 0 ? "warning" : "neutral"}
        />
        <SummaryTile
          label="Sudah dibayar"
          value={`${counts.paid} pesanan`}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable orders={orders} />
        </CardContent>
      </Card>

      {meta.total_pages > 1 && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-foreground/55">
            {meta.total} pesanan · halaman {meta.page} dari {meta.total_pages}
          </p>
          <Pagination
            page={page}
            totalPages={meta.total_pages}
            searchParams={params}
          />
        </div>
      )}

      <p className="text-xs text-foreground/50">
        Butuh membuat pesanan baru?{" "}
        <Link href="/events" className="text-accent hover:underline">
          Pilih acara
        </Link>{" "}
        lalu buka tab <span className="font-medium">Pesanan</span>.
      </p>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-5">
        <span className="text-sm text-foreground/65">{label}</span>
        <span className={`font-display text-2xl font-medium tracking-tight ${toneClass}`}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
      </CardContent>
    </Card>
  );
}
