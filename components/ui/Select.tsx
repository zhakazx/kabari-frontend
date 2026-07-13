import { cn } from "@/lib/utils";
import { controlBase } from "@/components/ui/Input";
import { IconChevronDown } from "@/components/ui/icons";

export function Select({
  className,
  invalid,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "h-10 appearance-none pl-3 pr-9",
          invalid &&
            "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
      />
    </div>
  );
}
