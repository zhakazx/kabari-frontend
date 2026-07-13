"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const RANGES: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: "7 hari" },
  { value: 30, label: "30 hari" },
  { value: 90, label: "90 hari" },
];

/**
 * URL-driven day-range switcher. Clicking a chip updates `?days=` while
 * preserving any other search params. Uses `router.replace` so the back
 * button doesn't fill up with intermediate states.
 */
export function TrendRangeSwitcher({ current }: { current: 7 | 30 | 90 }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function pick(days: 7 | 30 | 90) {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (days === 30) next.delete("days");
    else next.set("days", String(days));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Rentang waktu"
      className="inline-flex h-9 items-center rounded-full border border-border bg-surface p-0.5"
    >
      {RANGES.map((r) => {
        const isActive = current === r.value;
        return (
          <button
            key={r.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => pick(r.value)}
            className={cn(
              "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/65 hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
