import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getCreatorAnalytics } from "@/lib/dal-admin";
import { formatRupiah, toNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { IconCoins } from "@/components/ui/icons";
import type { CreatorAnalytics } from "@/lib/types";

export default function CreatorLeaderboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Admin · Analitik · Kreator
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Papan peringkat kreator
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Kreator diurutkan berdasarkan total royalti yang diterima. Top 3
          disorot.
        </p>
      </div>

      <Suspense fallback={<LeaderboardFallback />}>
        <Leaderboard />
      </Suspense>
    </div>
  );
}

async function Leaderboard() {
  const session = await requireRole("admin");
  const rows = await getCreatorAnalytics(session);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<IconCoins size={22} />}
        title="Belum ada kreator"
        description="Papan peringkat akan tampil di sini setelah ada kreator yang template-nya terjual."
      />
    );
  }

  const totalRoyalty = rows.reduce(
    (acc, r) => acc + toNumber(r.total_royalty),
    0,
  );
  const totalSales = rows.reduce((acc, r) => acc + r.total_sales, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="Kreator"
          value={rows.length.toLocaleString("id-ID")}
          hint="Aktif di platform"
        />
        <SummaryTile
          label="Total penjualan"
          value={totalSales.toLocaleString("id-ID")}
          hint="Akumulasi semua kreator"
        />
        <SummaryTile
          label="Total royalti"
          value={formatRupiah(totalRoyalty)}
          hint="Dibayarkan ke kreator"
          highlight
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peringkat kreator</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <THead>
                <TR>
                  <TH className="w-12">#</TH>
                  <TH>Kreator</TH>
                  <TH className="hidden sm:table-cell">Template</TH>
                  <TH className="hidden sm:table-cell">Penjualan</TH>
                  <TH>Royalti</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, idx) => (
                  <LeaderboardRow key={row.creator_id} rank={idx + 1} row={row} />
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardRow({
  rank,
  row,
}: {
  rank: number;
  row: CreatorAnalytics;
}) {
  const isPodium = rank <= 3;
  const rankTone =
    rank === 1
      ? "bg-warning/15 text-warning border-warning/30"
      : rank === 2
        ? "bg-foreground/[0.06] text-foreground/85 border-border"
        : rank === 3
          ? "bg-accent-soft text-accent border-accent/25"
          : "bg-surface-muted text-foreground/65 border-border";

  return (
    <TR>
      <TD>
        <span
          className={
            "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums " +
            rankTone
          }
        >
          {rank}
        </span>
      </TD>
      <TD>
        <div className="flex items-center gap-3">
          <Avatar name={row.creator_name} size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {row.creator_name}
            </span>
            {isPodium ? (
              <span className="text-[0.7rem] uppercase tracking-[0.18em] text-warning sm:hidden">
                Podium
              </span>
            ) : null}
          </div>
        </div>
      </TD>
      <TD className="hidden sm:table-cell">
        <span className="text-sm text-foreground/80 tabular-nums">
          {row.total_templates.toLocaleString("id-ID")}
        </span>
      </TD>
      <TD className="hidden sm:table-cell">
        <span className="text-sm text-foreground/80 tabular-nums">
          {row.total_sales.toLocaleString("id-ID")}
        </span>
      </TD>
      <TD>
        <span className="flex items-center gap-2 font-medium text-foreground">
          {formatRupiah(row.total_royalty)}
          {isPodium ? <Badge variant="warning">{podiumLabel(rank)}</Badge> : null}
        </span>
      </TD>
    </TR>
  );
}

function podiumLabel(rank: number): string {
  if (rank === 1) return "Juara";
  if (rank === 2) return "Runner-up";
  return "Podium";
}

function SummaryTile({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "relative overflow-hidden border-0 bg-[#16140f] text-[#fbfaf6] shadow-none"
          : undefined
      }
    >
      {highlight ? (
        <div
          aria-hidden
          className="qr-grid absolute inset-0 text-white/[0.05]"
        />
      ) : null}
      <CardContent
        className={
          "relative flex flex-col gap-1.5 p-5 " +
          (highlight ? "text-[#fbfaf6]" : "")
        }
      >
        <span
          className={
            "text-sm " + (highlight ? "text-white/65" : "text-foreground/65")
          }
        >
          {label}
        </span>
        <span
          className={
            "font-display text-2xl font-medium tracking-tight " +
            (highlight ? "text-[#fbfaf6]" : "text-foreground")
          }
        >
          {value}
        </span>
        <span
          className={
            "text-xs " + (highlight ? "text-white/55" : "text-foreground/55")
          }
        >
          {hint}
        </span>
      </CardContent>
    </Card>
  );
}

function LeaderboardFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
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
        <CardContent className="flex flex-col gap-2 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
