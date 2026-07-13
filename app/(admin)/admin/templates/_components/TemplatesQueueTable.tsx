"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { IconLayers, IconSearch } from "@/components/ui/icons";
import { formatDate, formatRupiah, statusBadgeVariant } from "@/lib/utils";
import type { Template, TemplateStatus } from "@/lib/types";

/**
 * Renders the template list for a single page. A free-text search over
 * name/category/creator is applied client-side on the current page's items.
 *
 * Status filtering is handled server-side via URL params (the chips in
 * the parent page), so this component only receives pre-filtered items.
 */
export function TemplatesQueueTable({
  items,
  search: initialSearch = "",
}: {
  items: Template[];
  search?: string;
}) {
  const [search, setSearch] = useState(initialSearch);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((t) => {
      return (
        t.name.toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle) ||
        (t.creator?.full_name.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [items, search]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SearchInput value={search} onChange={setSearch} />
        <EmptyState
          icon={<IconLayers size={22} />}
          title="Tidak ada template"
          description="Tidak ada template yang cocok dengan filter saat ini."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={search} onChange={setSearch} />

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-4 py-3 text-left first:pl-6">Template</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  Kreator
                </th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  Harga
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  Dibuat
                </th>
                <th className="px-4 py-3 text-right last:pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-surface-muted/50"
                >
                  <td className="px-4 py-3 align-middle first:pl-6">
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
                        <a
                          href={`/admin/templates/${t.id}`}
                          className="font-medium text-foreground hover:text-accent"
                        >
                          {t.name}
                        </a>
                        <span className="text-xs text-foreground/55">
                          {t.category}
                        </span>
                        {t.status === "rejected" && t.admin_notes ? (
                          <span
                            className="line-clamp-1 text-xs text-danger md:hidden"
                            title={t.admin_notes}
                          >
                            {t.admin_notes}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 align-middle md:table-cell">
                    <span className="text-sm text-foreground/75">
                      {t.creator?.full_name ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 align-middle sm:table-cell">
                    <span className="text-sm font-medium text-foreground">
                      {formatRupiah(t.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge variant={statusBadgeVariant(t.status)} dot>
                      {statusLabel(t.status)}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 align-middle lg:table-cell">
                    <span className="text-xs text-foreground/65">
                      {formatDate(t.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle last:pr-6">
                    <div className="flex items-center justify-end">
                      <Button
                        href={`/admin/templates/${t.id}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                      >
                        Tinjau
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border bg-surface-muted/40 px-6 py-2.5 text-xs text-foreground/55">
          Menampilkan {filtered.length} dari {items.length} template
        </p>
      </div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <IconSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari nama, kategori, kreator…"
        aria-label="Cari template"
        className="h-10 pl-9"
      />
    </div>
  );
}

function statusLabel(status: TemplateStatus): string {
  switch (status) {
    case "draft":
      return "Draf";
    case "pending_review":
      return "Menunggu tinjauan";
    case "published":
      return "Dipublikasikan";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
}
