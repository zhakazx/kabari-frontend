import { cn } from "@/lib/utils";

export function Switch({
  className,
  label,
  id,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}
    >
      <span className="relative inline-block">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />
        <span className="block h-6 w-10 rounded-full bg-border transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-disabled:opacity-60" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
