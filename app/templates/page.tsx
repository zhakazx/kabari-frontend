import { Suspense } from "react";
import type { Metadata } from "next";

import { getPublishedTemplates, type TemplateQuery } from "@/lib/dal-public";
import { cn } from "@/lib/utils";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateGridSkeleton } from "@/components/templates/TemplateGridSkeleton";
import { FilterChips, type FilterChip } from "@/components/shared/FilterChips";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconLayers } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Template Undangan",
  description:
    "Telusuri katalog template undangan digital KABARI — pilih desain untuk pernikahan, ulang tahun, aqiqah, dan acara corporate.",
  openGraph: {
    title: "Template Undangan · KABARI",
    description:
      "Telusuri katalog template undangan digital KABARI — pilih desain untuk pernikahan, ulang tahun, aqiqah, dan acara corporate.",
  },
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { page: null, limit: null, category: null, keyword: null } },
    { searchParams: { page: "2", limit: null, category: "digital", keyword: null } },
    { searchParams: { page: null, limit: null, category: null, keyword: "wedding" } },
  ],
};

const PAGE_SIZE = 20;

const CATEGORIES: FilterChip[] = [
  { value: "digital", label: "Digital" },
  { value: "fisik", label: "Fisik" },
  { value: "wedding", label: "Pernikahan" },
  { value: "ulang-tahun", label: "Ulang tahun" },
  { value: "aqiqah", label: "Aqiqah" },
  { value: "corporate", label: "Corporate" },
];

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

type SearchParamsPromise = Promise<{
  page?: string;
  limit?: string;
  category?: string;
  keyword?: string;
}>;

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const limit = Number(params.limit) || PAGE_SIZE;
  const category = params.category?.trim() || undefined;
  const keyword = params.keyword?.trim() || undefined;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Katalog
        </p>
        <h1 className="font-display text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl">
          Template undangan
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/65">
          Pilih desain yang paling dekat dengan acara Anda. Setiap template
          dapat disesuaikan setelah Anda membuat acara.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense
          fallback={
            <div
              className="h-9 w-64 animate-pulse rounded-md bg-surface-muted"
              aria-hidden
            />
          }
        >
          <FilterChips
            items={CATEGORIES}
            activeValue={category}
            searchParams={params}
          />
        </Suspense>
        <SearchInput
          paramName="keyword"
          placeholder="Cari template…"
          className="sm:max-w-xs"
        />
      </div>

      <Suspense fallback={<TemplateGridSkeleton count={6} />}>
        <TemplateResults
          page={page}
          limit={limit}
          category={category}
          keyword={keyword}
          searchParams={params}
        />
      </Suspense>
    </main>
  );
}

async function TemplateResults({
  page,
  limit,
  category,
  keyword,
  searchParams,
}: {
  page: number;
  limit: number;
  category: string | undefined;
  keyword: string | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query: TemplateQuery = { page, limit, category, keyword };
  const { items, meta } = await getPublishedTemplates(query);

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-foreground/55">
          {keyword || category
            ? `Tidak ada template yang cocok dengan filter saat ini.`
            : "Belum ada template yang dipublikasikan."}
        </p>
        <EmptyState
          icon={<IconLayers size={22} />}
          title="Belum ada template"
          description={
            keyword || category
              ? "Coba ubah kata kunci atau pilih kategori lain."
              : "Template akan tampil di sini setelah kreator menerbitkannya."
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {items.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-foreground/55">
          {meta.total} template · halaman {meta.page} dari {meta.total_pages}
          {keyword ? ` · "${keyword}"` : ""}
        </p>
        <Pagination
          page={page}
          totalPages={meta.total_pages}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
