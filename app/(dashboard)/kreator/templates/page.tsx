import Link from "next/link";
import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getMyTemplates, type MyTemplateQuery } from "@/lib/dal-kreator";
import {
  TEMPLATE_STATUS_LABELS,
  formatDate,
  formatRupiah,
  statusBadgeVariant,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { FilterChips, type FilterChip } from "@/components/shared/FilterChips";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { IconArrowRight, IconLayers, IconPlus } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Template } from "@/lib/types";

const PAGE_SIZE = 20;

const CATEGORIES: FilterChip[] = [
  { value: "wedding", label: "Pernikahan" },
  { value: "ulang-tahun", label: "Ulang tahun" },
  { value: "aqiqah", label: "Aqiqah" },
  { value: "corporate", label: "Corporate" },
  { value: "digital", label: "Digital" },
  { value: "fisik", label: "Fisik" },
];

type SearchParamsPromise = Promise<{
  page?: string;
  limit?: string;
  category?: string;
  keyword?: string;
}>;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function parseString(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

/**
 * The kreator studio. Static shell (header, filters) renders without
 * reading cookies; the auth + data fetch live in a `<Suspense>` boundary
 * so navigation to this page feels instant and the per-user list streams
 * in afterwards.
 */
export default function KreatorTemplatesPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
            Studio
          </p>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Template Anda
          </h1>
          <p className="max-w-2xl text-sm text-foreground/65">
            Rancang, ajukan tinjauan, dan raih royalti. Status
            <span className="px-1 font-medium text-foreground/85">
              Menunggu tinjauan
            </span>{" "}
            berarti sudah dikirim ke tim KABARI; draf masih bisa diedit tanpa
            batas.
          </p>
        </div>
        <Button href="/kreator/templates/new" size="md">
          <IconPlus size={16} />
          Buat template
        </Button>
      </header>

      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-9 w-full max-w-3xl animate-pulse rounded-md bg-surface-muted"
          />
        }
      >
        <FiltersRow searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<StudioFallback />}>
        <Studio searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FiltersRow({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  // Reading the searchParams is cheap; the FiltersRow still benefits from
  // being a separate async island so a typing-into-SearchInput doesn't
  // suspend the page.
  const params = await searchParams;
  const category = parseString(params.category);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <FilterChips
        items={CATEGORIES}
        activeValue={category}
        searchParams={params}
      />
      <SearchInput
        paramName="keyword"
        placeholder="Cari template Anda…"
        className="sm:max-w-xs"
      />
    </div>
  );
}

async function Studio({ searchParams }: { searchParams: SearchParamsPromise }) {
  // The auth check + data fetch live here so the page shell can be cached.
  const session = await requireRole("kreator");
  const params = await searchParams;
  const page = parsePage(params.page);
  const limit = Number(params.limit) || PAGE_SIZE;
  const category = parseString(params.category);
  const keyword = parseString(params.keyword);

  const query: MyTemplateQuery = { page, limit, category, keyword };
  const { items, meta } = await getMyTemplates(session, query);

  return (
    <div className="flex flex-col gap-5">
      <SummaryStrip items={items} />

      {items.length === 0 ? (
        <EmptyState
          icon={<IconLayers size={22} />}
          title={
            keyword || category
              ? "Tidak ada template yang cocok"
              : "Belum ada template"
          }
          description={
            keyword || category
              ? "Coba ubah kata kunci atau pilih kategori lain."
              : "Mulai dengan satu template pertama — unggah thumbnail, isi detail, dan kirim untuk ditinjau."
          }
          action={
            <Button href="/kreator/templates/new" size="md">
              <IconPlus size={16} />
              Buat template
            </Button>
          }
        />
      ) : (
        <TemplatesTable items={items} />
      )}

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-foreground/55">
          {meta.total} template · halaman {meta.page} dari {meta.total_pages}
          {keyword ? ` · "${keyword}"` : ""}
        </p>
        <Pagination
          page={page}
          totalPages={meta.total_pages}
          searchParams={params}
          ariaLabel="Navigasi halaman template kreator"
        />
      </div>
    </div>
  );
}

function SummaryStrip({ items }: { items: Template[] }) {
  const published = items.filter((t) => t.status === "published").length;
  const pending = items.filter((t) => t.status === "pending_review").length;
  const rejected = items.filter((t) => t.status === "rejected").length;
  const draft = items.filter((t) => t.status === "draft").length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StudioStat label="Dipublikasikan" value={published} tone="success" />
      <StudioStat label="Menunggu tinjauan" value={pending} tone="warning" />
      <StudioStat label="Ditolak" value={rejected} tone="danger" />
      <StudioStat label="Draf" value={draft} tone="neutral" />
    </div>
  );
}

function StudioStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const ring =
    tone === "success"
      ? "ring-success/30"
      : tone === "warning"
        ? "ring-warning/30"
        : tone === "danger"
          ? "ring-danger/30"
          : "ring-border";
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.18em] text-foreground/55">
            {label}
          </span>
          <span className="font-display text-2xl font-medium tracking-tight">
            {value.toLocaleString("id-ID")}
          </span>
        </div>
        <span
          aria-hidden
          className={`inline-block h-2.5 w-2.5 rounded-full ring-4 ${ring}`}
        />
      </CardContent>
    </Card>
  );
}

function TemplatesTable({ items }: { items: Template[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Table>
        <THead>
          <TR>
            <TH>Template</TH>
            <TH className="hidden md:table-cell">Kategori</TH>
            <TH className="hidden sm:table-cell">Harga</TH>
            <TH>Status</TH>
            <TH className="hidden lg:table-cell">Dibuat</TH>
            <TH className="text-right">Aksi</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((t) => (
            <TR key={t.id}>
              <TD>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                    {t.thumbnail_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={t.thumbnail_url}
                        alt={t.name}
                        className="block h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col">
                    <Link
                      href={`/kreator/templates/${t.id}/edit`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {t.name}
                    </Link>
                    {t.status === "rejected" && t.admin_notes ? (
                      <span
                        className="line-clamp-1 text-xs text-danger"
                        title={t.admin_notes}
                      >
                        Catatan tim: {t.admin_notes}
                      </span>
                    ) : (
                      <span className="text-xs text-foreground/55 md:hidden">
                        {t.category} · {formatRupiah(t.price)}
                      </span>
                    )}
                  </div>
                </div>
              </TD>
              <TD className="hidden md:table-cell">
                <span className="text-sm text-foreground/75">{t.category}</span>
              </TD>
              <TD className="hidden sm:table-cell">
                <span className="text-sm font-medium text-foreground">
                  {formatRupiah(t.price)}
                </span>
              </TD>
              <TD>
                <Badge variant={statusBadgeVariant(t.status)} dot>
                  {TEMPLATE_STATUS_LABELS[t.status]}
                </Badge>
              </TD>
              <TD className="hidden lg:table-cell">
                <span className="text-xs text-foreground/65">
                  {formatDate(t.created_at)}
                </span>
              </TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    href={`/kreator/templates/${t.id}/edit`}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                  >
                    {t.status === "draft" ? "Lanjut edit" : "Lihat"}
                    <IconArrowRight size={14} />
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function StudioFallback() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-10" />
              </div>
              <Skeleton className="h-3 w-3 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border p-4 last:border-b-0"
          >
            <Skeleton className="h-12 w-16" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
