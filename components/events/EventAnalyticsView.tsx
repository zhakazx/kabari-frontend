import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toNumber } from "@/lib/utils";
import type { EventAnalytics } from "@/lib/types";

/**
 * Compact analytic tiles for a single event. The backend returns counts in
 * two `Record<string, number>` maps (RSVP and check-in); we lay them out
 * as side-by-side breakdown bars. Attendance rate is shown as a hero stat.
 */
export function EventAnalyticsView({ analytics }: { analytics: EventAnalytics }) {
  const totalInvitations = toNumber(analytics.total_invitations);
  const attendanceRate = toNumber(analytics.attendance_rate);

  const rsvp = analytics.rsvp_breakdown ?? {};
  const checkIn = analytics.check_in_breakdown ?? {};

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-2 p-6">
          <span className="text-sm text-foreground/65">Tingkat kehadiran</span>
          <span className="font-display text-4xl font-medium tracking-tight text-foreground">
            {attendanceRate.toFixed(1)}%
          </span>
          <span className="text-xs text-foreground/55">
            Dari {totalInvitations.toLocaleString("id-ID")} tamu yang diundang.
          </span>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Komposisi RSVP"
          items={[
            { key: "hadir", label: "Hadir", value: rsvp.hadir, tone: "success" },
            {
              key: "tidak_hadir",
              label: "Tidak hadir",
              value: rsvp.tidak_hadir,
              tone: "danger",
            },
            { key: "pending", label: "Menunggu", value: rsvp.pending, tone: "warning" },
          ]}
          total={totalInvitations}
        />
        <BreakdownCard
          title="Komposisi Check-in"
          items={[
            {
              key: "sudah_check_in",
              label: "Sudah",
              value: checkIn.sudah_check_in,
              tone: "info",
            },
            {
              key: "belum_check_in",
              label: "Belum",
              value: checkIn.belum_check_in,
              tone: "neutral",
            },
          ]}
          total={totalInvitations}
        />
      </div>
    </div>
  );
}

const TONES = {
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
  neutral: "bg-foreground/30",
} as const;

function BreakdownCard({
  title,
  items,
  total,
}: {
  title: string;
  items: { key: string; label: string; value: number | string | undefined; tone: keyof typeof TONES }[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-foreground/55">Belum ada data.</p>
        ) : (
          <>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              {items.map((it) => {
                const v = toNumber(it.value);
                const pct = total > 0 ? (v / total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={it.key}
                    className={TONES[it.tone]}
                    style={{ width: `${pct}%` }}
                    title={`${it.label}: ${v}`}
                  />
                );
              })}
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {items.map((it) => {
                const v = toNumber(it.value);
                return (
                  <li
                    key={it.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="inline-flex items-center gap-2 text-foreground/80">
                      <span
                        aria-hidden
                        className={`inline-block h-2 w-2 rounded-full ${TONES[it.tone]}`}
                      />
                      {it.label}
                    </span>
                    <span className="font-medium text-foreground">
                      {v.toLocaleString("id-ID")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
