import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getPlatformKpi } from "@/lib/dal-admin";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  IconChart,
  IconCoins,
  IconLayers,
  IconUsers,
} from "@/components/ui/icons";
import { BreakdownList } from "@/app/(admin)/admin/analytics/_components/BreakdownList";

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

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  failed: "Gagal",
  cancelled: "Dibatalkan",
};

export default function PlatformAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Admin · Analitik
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          KPI platform
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Ringkasan metrik utama KABARI — pengguna aktif, acara, template,
          dan pendapatan kumulatif.
        </p>
      </div>

      <Suspense fallback={<KpiFallback />}>
        <KpiIsland />
      </Suspense>
    </div>
  );
}

async function KpiIsland() {
  const session = await requireRole("admin");
  const kpi = await getPlatformKpi(session);

  if (!kpi) {
    return (
      <EmptyState
        icon={<IconChart size={22} />}
        title="Belum ada data"
        description="KPI platform akan tampil di sini setelah ada aktivitas pertama."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Pengguna"
          value={kpi.total_users}
          icon={<IconUsers size={18} />}
        />
        <KpiCard
          label="Acara"
          value={kpi.total_events}
          icon={<IconChart size={18} />}
        />
        <KpiCard
          label="Template"
          value={kpi.total_templates}
          icon={<IconLayers size={18} />}
        />
        <RevenueCard value={kpi.total_revenue} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
        <BreakdownCard
          title="Pesanan per status"
          data={kpi.orders_by_status}
          keyLabel={ORDER_STATUS_LABELS}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-foreground/55">
          {label}
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent"
          >
            {icon}
          </span>
        </span>
        <span className="font-display text-3xl font-medium tracking-tight">
          {value.toLocaleString("id-ID")}
        </span>
      </CardContent>
    </Card>
  );
}

function RevenueCard({ value }: { value: number }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-[#16140f] text-[#fbfaf6] shadow-none">
      <div aria-hidden className="qr-grid absolute inset-0 text-white/[0.05]" />
      <CardContent className="relative flex flex-col gap-2 p-5">
        <span className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Pendapatan
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-accent-foreground"
          >
            <IconCoins size={16} />
          </span>
        </span>
        <span className="font-display text-3xl font-medium tracking-tight text-[#fbfaf6]">
          {formatRupiah(value)}
        </span>
        <span className="text-[0.7rem] text-white/50">
          Kumulatif pesanan yang dibayar
        </span>
      </CardContent>
    </Card>
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

function KpiFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3 p-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-2/3" />
              <Skeleton className="h-2 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
