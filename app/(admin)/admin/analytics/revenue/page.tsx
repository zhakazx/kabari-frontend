import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getRevenueTrend } from "@/lib/dal-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconChart, IconCoins } from "@/components/ui/icons";
import { RevenueTrendChart } from "@/app/(admin)/admin/analytics/_components/RevenueTrendChart";
import { TrendRangeSwitcher } from "@/app/(admin)/admin/analytics/_components/TrendRangeSwitcher";

const ALLOWED_DAYS = [7, 30, 90] as const;
type AllowedDays = (typeof ALLOWED_DAYS)[number];

function parseDays(raw: string | string[] | undefined): AllowedDays {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return ALLOWED_DAYS.find((d) => d === n) ?? 30;
}

type SearchParams = Promise<{ days?: string }>;

export default async function RevenueTrendPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const days = parseDays(params.days);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Admin · Analitik · Pendapatan
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Tren pendapatan
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Pendapatan harian dari pesanan yang sudah dibayar. Pilih rentang
          untuk melihat tren 7, 30, atau 90 hari terakhir.
        </p>
      </div>

      <Suspense
        key={days}
        fallback={<TrendFallback />}
      >
        <TrendIsland days={days} />
      </Suspense>
    </div>
  );
}

async function TrendIsland({ days }: { days: AllowedDays }) {
  const session = await requireRole("admin");
  const points = await getRevenueTrend(session, days);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <IconCoins size={18} className="text-accent" />
              Pendapatan {days} hari terakhir
            </CardTitle>
            <p className="text-xs text-foreground/55">
              {points.length} titik data · pesanan terbayar
            </p>
          </div>
          <TrendRangeSwitcher current={days} />
        </div>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-foreground/55">
            <IconChart size={22} />
            <p className="text-sm">
              Belum ada pesanan terbayar dalam {days} hari terakhir.
            </p>
          </div>
        ) : (
          <RevenueTrendChart points={points} />
        )}
      </CardContent>
    </Card>
  );
}

function TrendFallback() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  );
}
