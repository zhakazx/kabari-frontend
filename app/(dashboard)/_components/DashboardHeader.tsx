import { ROLE_LABELS, formatDate } from "@/lib/utils";

/**
 * Welcome banner at the top of every role's dashboard. Localises the
 * date in Indonesian and addresses the user by their first name.
 */
export function DashboardHeader({
  name,
  role,
  eyebrow,
  title,
  description,
}: {
  name: string;
  role: "pelanggan" | "kreator" | "penerima_tamu" | "admin";
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const firstName = name.split(" ")[0] ?? name;
  const today = formatDate(new Date().toISOString());
  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
        {eyebrow ?? "Beranda"}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {title ?? `Halo, ${firstName}`}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-foreground/65">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right text-xs text-foreground/55">
          <span>{today}</span>
          <span className="font-medium text-foreground/70">
            {ROLE_LABELS[role]}
          </span>
        </div>
      </div>
    </header>
  );
}
