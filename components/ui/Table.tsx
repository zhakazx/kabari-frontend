import { cn } from "@/lib/utils";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <thead
      className={cn(
        "bg-surface-muted text-xs font-semibold uppercase tracking-wide text-foreground/60",
        className,
      )}
    >
      {children}
    </thead>
  );
}

export function TBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}

export function TR({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-surface-muted/50", className)}>
      {children}
    </tr>
  );
}

export function TH({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-semibold first:pl-6 last:pr-6",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <td className={cn("px-4 py-3 align-middle first:pl-6 last:pr-6", className)}>
      {children}
    </td>
  );
}
