import { cn } from "@/lib/utils";

export const controlBase =
  "w-full rounded-md border border-border bg-surface text-sm text-foreground placeholder:text-foreground/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:border-accent disabled:opacity-60 disabled:bg-surface-muted";

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "h-10 px-3",
        invalid && "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "min-h-24 resize-y px-3 py-2 leading-relaxed",
        invalid && "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
        className,
      )}
      {...props}
    />
  );
}
