import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getMyRoyalties } from "@/lib/dal-kreator";
import type { RoyaltyQuery } from "@/lib/dal-kreator";
import { formatDate, formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { IconCoins } from "@/components/ui/icons";
import type { TemplateSale } from "@/lib/types";

const PAGE_SIZE = 20;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function RoyaltiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Royalti
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Pembayaran royalti Anda
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Setiap kali template Anda terjual, 20% dari total pesanan otomatis
          masuk ke buku besar ini. Pembayaran dilakukan sesuai jadwal tim
          keuangan KABARI.
        </p>
      </div>

      <Suspense fallback={<RoyaltiesFallback />}>
        <Royalties page={page} searchParams={params} />
      </Suspense>
    </div>
  );
}

async function Royalties({
  page,
  searchParams,
}: {
  page: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await requireRole("kreator");
  const query: RoyaltyQuery = { page, limit: PAGE_SIZE };
  const { items: sales, meta, totals } = await getMyRoyalties(session, query);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <RoyaltyHero
          label="Total royalti"
          value={formatRupiah(totals.total_royalty)}
          hint={`${meta.total.toLocaleString("id-ID")} penjualan`}
        />
        <RoyaltyTile
          label="Sudah dibayar"
          value={formatRupiah(totals.paid_amount)}
          tone="success"
          hint={`${totals.paid_count.toLocaleString("id-ID")} penjualan`}
        />
        <RoyaltyTile
          label="Menunggu pembayaran"
          value={formatRupiah(totals.pending_amount)}
          tone={totals.pending_count > 0 ? "warning" : "neutral"}
          hint={`${totals.pending_count.toLocaleString("id-ID")} penjualan`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buku besar royalti</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <EmptyState
              icon={<IconCoins size={22} />}
              title="Belum ada royalti"
              description="Royalti akan tampil di sini setiap kali template Anda dibeli oleh pelanggan."
            />
          ) : (
            <RoyaltyLedger sales={sales} />
          )}

          {meta.total_pages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-xs text-foreground/55">
                {meta.total} penjualan · halaman {meta.page} dari{" "}
                {meta.total_pages}
              </p>
              <Pagination
                page={page}
                totalPages={meta.total_pages}
                searchParams={searchParams}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RoyaltyHero({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 bg-[#16140f] text-[#fbfaf6] shadow-none sm:col-span-3">
      <div aria-hidden className="qr-grid absolute inset-0 text-white/[0.05]" />
      <CardContent className="relative flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
            {label}
          </span>
          <span className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            {value}
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 text-sm text-white/65 sm:items-end">
          <IconCoins size={22} className="text-accent-foreground/80" />
          <span>{hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RoyaltyTile({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning";
  hint: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-5">
        <span className="text-sm text-foreground/65">{label}</span>
        <span
          className={`font-display text-2xl font-medium tracking-tight ${toneClass}`}
        >
          {value}
        </span>
        <span className="text-xs text-foreground/55">{hint}</span>
      </CardContent>
    </Card>
  );
}

function RoyaltyLedger({ sales }: { sales: TemplateSale[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <THead>
          <TR>
            <TH>Tanggal</TH>
            <TH>Template</TH>
            <TH className="hidden sm:table-cell">Invoice</TH>
            <TH className="hidden md:table-cell">Persentase</TH>
            <TH>Royalti</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {sales.map((s) => (
            <TR key={s.id}>
              <TD>
                <span className="text-sm text-foreground/80">
                  {formatDate(s.created_at)}
                </span>
              </TD>
              <TD>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {s.template?.name ?? "—"}
                  </span>
                  <span className="text-xs text-foreground/55">
                    Kategori {s.template?.category ?? "—"}
                  </span>
                </div>
              </TD>
              <TD className="hidden sm:table-cell">
                <span className="font-mono text-xs text-foreground/75">
                  #{s.order?.id?.slice(0, 8) ?? s.order_id.slice(0, 8)}
                </span>
              </TD>
              <TD className="hidden md:table-cell">
                <span className="text-sm text-foreground/75">
                  {s.royalty_percent}%
                </span>
              </TD>
              <TD>
                <span className="font-medium text-foreground">
                  {formatRupiah(s.royalty_amount)}
                </span>
              </TD>
              <TD>
                {s.paid_to_creator_at ? (
                  <span className="text-xs text-foreground/75">
                    Dibayar · {formatDate(s.paid_to_creator_at)}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-warning">
                    Menunggu
                  </span>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function RoyaltiesFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 bg-[#16140f] text-[#fbfaf6] shadow-none">
        <CardContent className="flex flex-col gap-3 p-6 sm:p-8">
          <SkeletonText lines={2} className="[&_*]:bg-white/10" />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
            >
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
