import Link from "next/link";

import {
  getCreatorAnalytics,
  getPlatformKpi,
  getRevenueTrend,
} from "@/lib/dal-admin";
import {
  formatRupiah,
  toNumber,
} from "@/lib/utils";
import type { Session } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

import {
  IconChart,
  IconCoins,
  IconLayers,
  IconUserCheck,
  IconUsers,
} from "@/components/ui/icons";
import { BreakdownList } from "@/app/(admin)/admin/analytics/_components/BreakdownList";
import { RevenueTrendChart } from "@/app/(admin)/admin/analytics/_components/RevenueTrendChart";

import { DashboardHeader } from "./DashboardHeader";
import { StatTile } from "./StatTile";

const USER_ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  pelanggan: "Pelanggan",
  kreator: "Kreator",
  penerima_tamu: "Penerima Tamu",
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  active: "Aktif",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const TEMPLATE_STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  pending_review: "Menunggu tinjauan",
  published: "Dipublikasikan",
  rejected: "Ditolak",
};

/**
 * Admin dashboard. Surfaces platform health at a glance: user/event/
 * template totals, revenue trend (last 30 days), and the top three
 * creators by royalty. Live data from the admin analytics endpoints.
 */
export async function AdminDashboard({ session }: { session: Session }) {
  const [kpi, creators, trend] = await Promise.all([
    getPlatformKpi(session).catch(() => null),
    getCreatorAnalytics(session).catch(() => []),
    getRevenueTrend(session, 30).catch(() => []),
  ]);

  const topCreators = creators.slice(0, 3);
  const last30Revenue = trend.reduce(
    (acc, p) => acc + toNumber(p.revenue),
    0,
  );
  const last30Orders = trend.reduce((acc, p) => acc + toNumber(p.orders), 0);

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={session.name}
        role="admin"
        eyebrow="Beranda · Admin"
        title={`Halo, ${session.name.split(" ")[0] ?? session.name}`}
        description="Tinjauan singkat platform KABARI — KPI, pendapatan, dan kreator teratas."
      />

      <section
        aria-label="KPI platform"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatTile
          label="Pengguna"
          value={(kpi?.total_users ?? 0).toLocaleString("id-ID")}
          icon={<IconUsers size={16} />}
          tone="info"
          href="/admin/users"
        />
        <StatTile
          label="Acara"
          value={(kpi?.total_events ?? 0).toLocaleString("id-ID")}
          icon={<IconChart size={16} />}
          href="/admin/analytics"
        />
        <StatTile
          label="Template"
          value={(kpi?.total_templates ?? 0).toLocaleString("id-ID")}
          icon={<IconLayers size={16} />}
          href="/admin/templates"
        />
        <StatTile
          label="Pendapatan kumulatif"
          value={formatRupiah(kpi?.total_revenue ?? 0)}
          icon={<IconCoins size={16} />}
          tone="success"
          hint={
            last30Revenue > 0
              ? `${formatRupiah(last30Revenue)} 30 hari terakhir`
              : "Belum ada pendapatan"
          }
          href="/admin/analytics/revenue"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <SectionHeader
            title="Pendapatan 30 hari"
            actionHref="/admin/analytics/revenue"
            actionLabel="Detail"
          />
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    Pendapatan · 30 hari
                  </span>
                  <span className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                    {formatRupiah(last30Revenue)}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-right text-xs text-foreground/55">
                  <span>{last30Orders.toLocaleString("id-ID")} pesanan</span>
                  <span>periode 30 hari</span>
                </div>
              </div>
              <RevenueTrendChart points={trend} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Kreator teratas"
            actionHref="/admin/analytics/creators"
            actionLabel="Papan peringkat"
          />
          {topCreators.length === 0 ? (
            <EmptyState
              icon={<IconUserCheck size={22} />}
              title="Belum ada royalti"
              description="Kreator dengan penjualan akan tampil di sini."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {topCreators.map((creator, i) => (
                <li key={creator.creator_id}>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <span
                        className={
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                          (i === 0
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface-muted text-foreground/70")
                        }
                      >
                        {i + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground">
                          {creator.creator_name}
                        </span>
                        <span className="text-xs text-foreground/55">
                          {creator.total_templates} template ·{" "}
                          {creator.total_sales} penjualan
                        </span>
                      </div>
                      <span className="font-display text-sm font-medium text-foreground">
                        {formatRupiah(creator.total_royalty)}
                      </span>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {kpi ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <BreakdownCard
            title="Pengguna per peran"
            data={kpi.users_by_role}
            keyLabel={USER_ROLE_LABELS}
          />
          <BreakdownCard
            title="Acara per status"
            data={kpi.events_by_status}
            keyLabel={EVENT_STATUS_LABELS}
          />
          <BreakdownCard
            title="Template per status"
            data={kpi.templates_by_status}
            keyLabel={TEMPLATE_STATUS_LABELS}
          />
        </section>
      ) : (
        <EmptyState
          icon={<IconChart size={22} />}
          title="Belum ada data"
          description="KPI platform akan tampil di sini setelah ada aktivitas pertama."
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Pintasan operator
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ShortcutCard
            href="/admin/users"
            label="Kelola pengguna"
            description="Lihat, buat, atau perbarui akun."
            tone="info"
          />
          <ShortcutCard
            href="/admin/templates"
            label="Tinjau template"
            description="Antrian kreator yang menunggu publikasi."
            tone="warning"
          />
          <ShortcutCard
            href="/admin/analytics"
            label="KPI platform"
            description="Rincian pengguna, acara, dan pesanan."
          />
          <ShortcutCard
            href="/admin/analytics/revenue"
            label="Tren pendapatan"
            description="Pergerakan harian dan bulanan."
            tone="success"
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-xs text-foreground/55">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="text-xs font-medium text-accent hover:underline"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  keyLabel,
}: {
  title: string;
  data: Record<string, number>;
  keyLabel: Record<string, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BreakdownList data={data} keyLabel={keyLabel} />
      </CardContent>
    </Card>
  );
}

function ShortcutCard({
  href,
  label,
  description,
  tone,
}: {
  href: string;
  label: string;
  description: string;
  tone?: "info" | "warning" | "success" | "neutral";
}) {
  const dotClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "info"
          ? "bg-accent"
          : "bg-foreground/30";
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-foreground/20"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        {tone ? (
          <span
            aria-hidden
            className={`inline-block h-2 w-2 rounded-full ${dotClass}`}
          />
        ) : null}
      </span>
      <span className="text-xs text-foreground/55">{description}</span>
    </Link>
  );
}
