import Link from "next/link";

import { cn } from "@/lib/utils";
import { buildHref } from "@/components/shared/Pagination";

export type FilterChip = {
  value: string;
  label: string;
};

/**
 * A row of "chips" that act as a category filter. The active chip is rendered
 * as a solid pill; the rest are outlined. Each chip is a `<Link>` so the page
 * navigates to a new URL (e.g. `?category=digital`), making the filter
 * shareable and re-hydratable on first load.
 */
export function FilterChips({
  items,
  activeValue,
  searchParams,
  paramName = "category",
  className,
  ariaLabel = "Filter kategori",
}: {
  items: FilterChip[];
  activeValue?: string;
  searchParams: Record<string, string | string[] | undefined>;
  paramName?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {items.map((it) => {
        const isActive = activeValue === it.value;
        return (
          <Link
            key={it.value}
            href={buildHref(searchParams, {
              [paramName]: isActive ? undefined : it.value,
              page: undefined,
            })}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition",
              isActive
                ? "border-ink/0 bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-surface text-foreground/75 hover:bg-surface-muted",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
