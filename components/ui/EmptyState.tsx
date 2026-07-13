import { cn } from "@/lib/utils";
import { IconInbox } from "@/components/ui/icons";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-foreground/50">
        {icon ?? <IconInbox size={22} />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-foreground">
          {title}
        </p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-foreground/60">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
