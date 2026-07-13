import Link from "next/link";

import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/ui/icons";

/**
 * Build a URL with the given `searchParams` merged over the current set.
 * Drops any key whose value is empty so links stay clean.
 */
export function buildHref(
  current: Record<string, string | string[] | undefined>,
  patch: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) if (v) params.append(key, v);
    } else if (value) {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") params.delete(key);
    else params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  searchParams,
  className,
  ariaLabel = "Navigasi halaman",
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  className?: string;
  ariaLabel?: string;
}) {
  if (totalPages <= 1) return null;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = pageRange(safePage, totalPages);

  const prev = safePage > 1 ? safePage - 1 : null;
  const next = safePage < totalPages ? safePage + 1 : null;

  const linkBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-2.5 text-sm font-medium transition";

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5",
        className,
      )}
    >
      {prev !== null ? (
        <Link
          href={buildHref(searchParams, { page: String(prev) })}
          aria-label="Halaman sebelumnya"
          className={cn(linkBase, "bg-surface text-foreground/80 hover:bg-surface-muted")}
        >
          <IconChevronDown size={16} className="rotate-90" />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(
            linkBase,
            "cursor-not-allowed bg-surface text-foreground/30",
          )}
        >
          <IconChevronDown size={16} className="rotate-90" />
        </span>
      )}

      {items.map((it, idx) =>
        it === "…" ? (
          <span
            key={`gap-${idx}`}
            className="px-1 text-sm text-foreground/40"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={it}
            href={buildHref(searchParams, {
              page: it === 1 ? undefined : String(it),
            })}
            aria-current={it === safePage ? "page" : undefined}
            className={cn(
              linkBase,
              it === safePage
                ? "border-ink/0 bg-primary text-primary-foreground"
                : "bg-surface text-foreground/80 hover:bg-surface-muted",
            )}
          >
            {it}
          </Link>
        ),
      )}

      {next !== null ? (
        <Link
          href={buildHref(searchParams, { page: String(next) })}
          aria-label="Halaman berikutnya"
          className={cn(linkBase, "bg-surface text-foreground/80 hover:bg-surface-muted")}
        >
          <IconChevronDown size={16} className="-rotate-90" />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(
            linkBase,
            "cursor-not-allowed bg-surface text-foreground/30",
          )}
        >
          <IconChevronDown size={16} className="-rotate-90" />
        </span>
      )}
    </nav>
  );
}
