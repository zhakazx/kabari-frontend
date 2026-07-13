import { toNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IconUsers, IconCheck, IconClipboardCheck, IconCalendar, IconAlert } from "@/components/ui/icons";
import type { EventDashboardStats } from "@/lib/types";

/**
 * Renders the 5 aggregated counts for a single event. The backend returns
 * raw SQL aggregates as strings (PostgreSQL `COUNT`), so we coerce each
 * value through `toNumber()` before display.
 *
 * A second row visualises the RSVP ratio as a thin stacked bar — quiet
 * and inline rather than a separate chart.
 */
export function EventStatsGrid({ stats }: { stats: EventDashboardStats }) {
  const total = toNumber(stats.total_tamu);
  const hadir = toNumber(stats.hadir);
  const tidakHadir = toNumber(stats.tidak_hadir);
  const belumRsvp = toNumber(stats.belum_rsvp);
  const checkIn = toNumber(stats.sudah_check_in);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<IconUsers size={18} />}
          label="Total Tamu"
          value={total}
          tone="neutral"
        />
        <StatCard
          icon={<IconCheck size={18} />}
          label="Hadir"
          value={hadir}
          tone="success"
        />
        <StatCard
          icon={<IconAlert size={18} />}
          label="Tidak Hadir"
          value={tidakHadir}
          tone="danger"
        />
        <StatCard
          icon={<IconCalendar size={18} />}
          label="Belum RSVP"
          value={belumRsvp}
          tone="warning"
        />
        <StatCard
          icon={<IconClipboardCheck size={18} />}
          label="Sudah Check-in"
          value={checkIn}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Komposisi RSVP</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {total === 0 ? (
            <p className="text-sm text-foreground/55">
              Belum ada tamu. Tambahkan tamu di tab{" "}
              <span className="font-medium text-foreground/80">Tamu</span>.
            </p>
          ) : (
            <>
              <RsvpBar
                hadir={hadir}
                tidakHadir={tidakHadir}
                belumRsvp={belumRsvp}
                total={total}
              />
              <ul className="flex flex-wrap items-center gap-4 text-xs text-foreground/65">
                <LegendDot tone="success" label={`Hadir · ${hadir}`} />
                <LegendDot tone="danger" label={`Tidak hadir · ${tidakHadir}`} />
                <LegendDot tone="warning" label={`Belum RSVP · ${belumRsvp}`} />
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground/70",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

const TONE_BAR: Record<"success" | "danger" | "warning", string> = {
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-foreground/65">{label}</span>
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${TONE_CLASSES[tone]}`}
            aria-hidden
          >
            {icon}
          </span>
        </div>
        <span className="font-display text-3xl font-medium tracking-tight text-foreground">
          {value.toLocaleString("id-ID")}
        </span>
      </CardContent>
    </Card>
  );
}

function RsvpBar({
  hadir,
  tidakHadir,
  belumRsvp,
  total,
}: {
  hadir: number;
  tidakHadir: number;
  belumRsvp: number;
  total: number;
}) {
  const segments: { value: number; tone: keyof typeof TONE_BAR; key: string }[] = [
    { value: hadir, tone: "success", key: "hadir" },
    { value: tidakHadir, tone: "danger", key: "tidak" },
    { value: belumRsvp, tone: "warning", key: "belum" },
  ];
  return (
    <div
      role="img"
      aria-label="Komposisi RSVP"
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      {segments.map((seg) => {
        const pct = total > 0 ? (seg.value / total) * 100 : 0;
        if (pct === 0) return null;
        return (
          <div
            key={seg.key}
            className={TONE_BAR[seg.tone]}
            style={{ width: `${pct}%` }}
            title={`${seg.key}: ${seg.value}`}
          />
        );
      })}
    </div>
  );
}

function LegendDot({ tone, label }: { tone: keyof typeof TONE_BAR; label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-full ${TONE_BAR[tone]}`}
      />
      <span>{label}</span>
    </li>
  );
}
