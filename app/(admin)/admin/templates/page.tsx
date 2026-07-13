import Link from "next/link";
import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getAllTemplates } from "@/lib/dal-admin";
import type { AdminTemplatesQuery } from "@/lib/dal-admin";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination, buildHref } from "@/components/shared/Pagination";
import { IconLayers } from "@/components/ui/icons";
import { TemplatesQueueTable } from "@/app/(admin)/admin/templates/_components/TemplatesQueueTable";
import type { TemplateStatus } from "@/lib/types";

const PAGE_SIZE = 20;

const STATUS_CHIPS: { value: TemplateStatus | "all"; label: string }[] = [
  { value: "pending_review", label: "Menunggu tinjauan" },
  { value: "published", label: "Dipublikasikan" },
  { value: "rejected", label: "Ditolak" },
  { value: "draft", label: "Draf" },
  { value: "all", label: "Semua" },
];

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const statusParam = params.status as string | undefined;
  const status = statusParam && statusParam !== "all" ? statusParam : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Admin · Template
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Antrean tinjauan
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Setujui atau tolak template yang dikirim kreator. Kreator akan
          melihat catatan penolakan dan bisa mengirim ulang.
        </p>
      </div>

      <Suspense fallback={<QueueFallback />}>
        <QueueIsland page={page} status={status} statusParam={statusParam} searchParams={params} />
      </Suspense>
    </div>
  );
}

async function QueueIsland({
  page,
  status,
  statusParam,
  searchParams,
}: {
  page: number;
  status: string | undefined;
  statusParam: string | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await requireRole("admin");
  const query: AdminTemplatesQuery = { page, limit: PAGE_SIZE, status };
  const { items, meta, counts } = await getAllTemplates(session, query);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconLayers size={18} className="text-accent" />
          Semua template
        </CardTitle>
        <p className="text-xs text-foreground/55">
          Filter default adalah template yang menunggu tinjauan. Klik baris
          untuk membuka detail dan menyetujui atau menolak.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div
            role="group"
            aria-label="Filter status"
            className="flex flex-wrap items-center gap-2"
          >
            {STATUS_CHIPS.map((chip) => {
              const isActive =
                chip.value === "all"
                  ? statusParam === undefined || statusParam === "all"
                  : statusParam === chip.value;
              return (
                <Link
                  key={chip.value}
                  href={buildHref(searchParams, {
                    status: isActive ? undefined : chip.value,
                    page: undefined,
                  })}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition",
                    isActive
                      ? "border-ink/0 bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-surface text-foreground/75 hover:bg-surface-muted",
                  )}
                >
                  {chip.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums",
                      isActive
                        ? "bg-white/15 text-primary-foreground/85"
                        : "bg-surface-muted text-foreground/55",
                    )}
                  >
                    {chip.value === "all"
                      ? counts.draft + counts.pending_review + counts.published + counts.rejected
                      : counts[chip.value]}
                  </span>
                </Link>
              );
            })}
          </div>

          <TemplatesQueueTable items={items} search={""} />

          {meta.total_pages > 1 && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-foreground/55">
                {meta.total} template · halaman {meta.page} dari{" "}
                {meta.total_pages}
              </p>
              <Pagination
                page={page}
                totalPages={meta.total_pages}
                searchParams={searchParams}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QueueFallback() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
