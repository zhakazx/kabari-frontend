import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/FieldLabel";

function asText(error: string | string[] | undefined): string | undefined {
  if (!error) return undefined;
  return Array.isArray(error) ? error.join(", ") : error;
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string | string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const errorText = asText(error);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      {children}
      {errorText ? (
        <p className="text-xs font-medium text-danger">{errorText}</p>
      ) : hint ? (
        <p className="text-xs text-foreground/55">{hint}</p>
      ) : null}
    </div>
  );
}
