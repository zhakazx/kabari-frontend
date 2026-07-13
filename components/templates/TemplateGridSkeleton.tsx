import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading skeleton for the template grid. Matches the visual rhythm of
 * `<TemplateCard>` so the transition into the real grid is seamless.
 */
export function TemplateGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Memuat template"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="mt-2 flex items-end justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
