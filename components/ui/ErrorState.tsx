import { cn } from "@/lib/utils";
import { IconAlert } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Maaf, sesuatu yang tidak terduga terjadi. Silakan coba lagi.",
  retry,
  retryLabel = "Coba lagi",
  action,
  className,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <IconAlert size={22} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-foreground">
          {title}
        </p>
        <p className="mx-auto max-w-sm text-sm text-foreground/60">
          {description}
        </p>
      </div>
      {action}
      {retry ? (
        <Button variant="outline" size="sm" onClick={retry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
