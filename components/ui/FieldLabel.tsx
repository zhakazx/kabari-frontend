import { cn } from "@/lib/utils";

export function FieldLabel({
  htmlFor,
  required,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        className,
      )}
    >
      {children}
      {required && <span className="ml-0.5 text-accent">*</span>}
    </label>
  );
}
