import Link from "next/link";

import { getMyRoyalties, getMyTemplates } from "@/lib/dal-kreator";
import {
  TEMPLATE_STATUS_LABELS,
  formatDate,
  formatRupiah,
  statusBadgeVariant,
  toNumber,
} from "@/lib/utils";
import type { Session, Template, TemplateSale } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  IconCheck,
  IconClipboardCheck,
  IconCoins,
  IconLayers,
  IconPlus,
  IconReceipt,
} from "@/components/ui/icons";

import { DashboardHeader } from "./DashboardHeader";
import { StatTile } from "./StatTile";

/**
 * Kreator (template designer) dashboard. Surfaces portfolio health
 * (templates by status), earnings, and recent sales.
 */
export async function KreatorDashboard({ session }: { session: Session }) {
  const [{ items: templates }, { items: sales }] = await Promise.all([
    getMyTemplates(session, { limit: 50 }),
    getMyRoyalties(session, { limit: 100 }).catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 100, total_pages: 0 }, totals: { total_royalty: 0, paid_amount: 0, pending_amount: 0, paid_count: 0, pending_count: 0 } })),
  ]);

  const counts = {
    draft: 0,
    pending_review: 0,
    published: 0,
    rejected: 0,
  };
  for (const t of templates) counts[t.status] = (counts[t.status] ?? 0) + 1;

  const pendingSales = sales.filter((s) => !s.paid_to_creator_at);
  const paidSales = sales.filter((s) => Boolean(s.paid_to_creator_at));
  const totalRoyalty = sales.reduce(
    (acc, s) => acc + toNumber(s.royalty_amount),
    0,
  );
  const paidRoyalty = paidSales.reduce(
    (acc, s) => acc + toNumber(s.royalty_amount),
    0,
  );
  const pendingRoyalty = pendingSales.reduce(
    (acc, s) => acc + toNumber(s.royalty_amount),
    0,
  );

  const recentTemplates = templates.slice(0, 5);
  const recentSales = sales.slice(0, 5);

  const salesByTemplate = new Map<string, { count: number; royalty: number }>();
  for (const s of sales) {
    const cur = salesByTemplate.get(s.template_id) ?? { count: 0, royalty: 0 };
    cur.count += 1;
    cur.royalty += toNumber(s.royalty_amount);
    salesByTemplate.set(s.template_id, cur);
  }
  const topTemplateId = [...salesByTemplate.entries()].sort(
    (a, b) => b[1].royalty - a[1].royalty,
  )[0]?.[0];
  const topTemplate = topTemplateId
    ? templates.find((t) => t.id === topTemplateId)
    : undefined;
  const topTemplateStats = topTemplateId
    ? salesByTemplate.get(topTemplateId)
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={session.name}
        role="kreator"
        eyebrow="Beranda"
        title={`Halo, ${session.name.split(" ")[0] ?? session.name}`}
        description="Kabar terbaru portofolio template dan royalti Anda."
      />

      <section
        aria-label="Ringkasan"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatTile
          label="Total template"
          value={templates.length}
          icon={<IconLayers size={16} />}
          hint={
            counts.published > 0
              ? `${counts.published} dipublikasikan`
              : "Belum ada yang tayang"
          }
          href="/kreator/templates"
        />
        <StatTile
          label="Menunggu tinjauan"
          value={counts.pending_review}
          icon={<IconClipboardCheck size={16} />}
          tone={counts.pending_review > 0 ? "warning" : "neutral"}
          hint={
            counts.rejected > 0
              ? `${counts.rejected} perlu revisi`
              : "Tidak ada antrian"
          }
          href="/kreator/templates?status=pending_review"
        />
        <StatTile
          label="Total royalti"
          value={formatRupiah(totalRoyalty)}
          icon={<IconCoins size={16} />}
          tone="success"
          hint={
            paidRoyalty > 0
              ? `${formatRupiah(paidRoyalty)} sudah dibayar`
              : "Belum ada pembayaran"
          }
          href="/kreator/royalties"
        />
        <StatTile
          label="Royalti tertunda"
          value={formatRupiah(pendingRoyalty)}
          icon={<IconReceipt size={16} />}
          tone={pendingRoyalty > 0 ? "info" : "neutral"}
          hint={
            pendingSales.length > 0
              ? `${pendingSales.length} penjualan`
              : "Tidak ada royalti tertunda"
          }
          href="/kreator/royalties"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <SectionHeader
            title="Template terbaru"
            actionHref="/kreator/templates"
            actionLabel="Lihat semua"
            action={
              <Button href="/kreator/templates/new" size="sm">
                <IconPlus size={14} />
                Template baru
              </Button>
            }
          />
          {recentTemplates.length === 0 ? (
            <EmptyState
              icon={<IconLayers size={22} />}
              title="Belum ada template"
              description="Mulai portofolio Anda dengan template pertama."
              action={
                <Button href="/kreator/templates/new" size="sm">
                  <IconPlus size={14} />
                  Buat template
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentTemplates.map((template) => (
                <TemplateRow key={template.id} template={template} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Penjualan terbaru"
            actionHref="/kreator/royalties"
            actionLabel="Lihat royalti"
          />
          {recentSales.length === 0 ? (
            <EmptyState
              icon={<IconCoins size={22} />}
              title="Belum ada penjualan"
              description="Penjualan template akan tampil di sini."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentSales.map((sale) => (
                <SaleRow key={sale.id} sale={sale} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {topTemplate && topTemplateStats ? (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Template terlaris"
            description="Berdasarkan akumulasi royalti."
          />
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-5">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {topTemplate.name}
                  </span>
                  <Badge variant={statusBadgeVariant(topTemplate.status)} dot>
                    {TEMPLATE_STATUS_LABELS[topTemplate.status]}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/55">
                  {topTemplateStats.count} penjualan ·{" "}
                  {formatRupiah(topTemplateStats.royalty)} royalti
                </p>
              </div>
              <Button
                href={`/kreator/templates/${topTemplate.id}/edit`}
                variant="outline"
                size="sm"
              >
                Lihat template
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
  action,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  action?: React.ReactNode;
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
      {action ? (
        action
      ) : actionHref && actionLabel ? (
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

function TemplateRow({ template }: { template: Template }) {
  return (
    <li>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">
                {template.name}
              </span>
              <Badge variant={statusBadgeVariant(template.status)} dot>
                {TEMPLATE_STATUS_LABELS[template.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-foreground/55">
              <span className="capitalize">{template.category}</span>
              <span>{formatDate(template.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-medium text-foreground">
              {formatRupiah(template.price)}
            </span>
            <Button
              href={`/kreator/templates/${template.id}/edit`}
              variant="outline"
              size="sm"
            >
              {template.status === "draft" ? "Lanjutkan" : "Kelola"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function SaleRow({ sale }: { sale: TemplateSale }) {
  const isPaid = Boolean(sale.paid_to_creator_at);
  return (
    <li>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">
                {sale.template?.name ?? "Template"}
              </span>
              <Badge variant={isPaid ? "success" : "warning"} dot>
                {isPaid ? (
                  <>
                    <IconCheck size={10} /> Dibayar
                  </>
                ) : (
                  "Tertunda"
                )}
              </Badge>
            </div>
            <p className="text-xs text-foreground/55">
              {formatDate(sale.created_at)} · pesanan #
              {sale.order_id.slice(0, 8)}
            </p>
          </div>
          <span className="font-display text-base font-medium text-foreground">
            {formatRupiah(sale.royalty_amount)}
          </span>
        </CardContent>
      </Card>
    </li>
  );
}
