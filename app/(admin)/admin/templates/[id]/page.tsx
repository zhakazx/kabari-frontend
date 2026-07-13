import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getTemplate } from "@/lib/dal-public";
import {
  TEMPLATE_STATUS_LABELS,
  formatDateTime,
  formatRupiah,
  statusBadgeVariant,
} from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IconArrowRight, IconLayers, IconUserCheck } from "@/components/ui/icons";
import { ReviewPanel } from "@/app/(admin)/admin/templates/_components/ReviewPanel";

/**
 * Admin → Template review. The `getTemplate` DAL hits the public
 * endpoint (`GET /templates/{id}`) which returns the template regardless
 * of status — exactly what the review surface needs.
 */
export default async function AdminTemplateReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-foreground/55">
        <Link href="/admin/templates" className="hover:text-foreground/80">
          Template
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span>{" "}
        <span className="text-foreground/80">{template.name}</span>
      </nav>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(template.status)} dot>
            {TEMPLATE_STATUS_LABELS[template.status]}
          </Badge>
          <span className="text-xs text-foreground/55">
            · Kategori {template.category}
          </span>
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {template.name}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
              {template.thumbnail_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="block h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-foreground/35">
                  <IconLayers size={48} />
                </div>
              )}
            </div>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    Harga
                  </span>
                  <span className="font-display text-2xl font-medium tracking-tight text-foreground">
                    {formatRupiah(template.price)}
                  </span>
                </div>
                {template.file_url ? (
                  <a
                    href={template.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    Buka berkas
                    <IconArrowRight size={12} />
                  </a>
                ) : null}
              </div>
              {template.description ? (
                <p className="text-sm leading-relaxed text-foreground/80">
                  {template.description}
                </p>
              ) : (
                <p className="text-sm italic text-foreground/45">
                  Kreator tidak menyertakan deskripsi.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUserCheck size={18} className="text-accent" />
                Kreator
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.creator ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    name={template.creator.full_name}
                    size="md"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {template.creator.full_name}
                    </span>
                    <span className="text-xs text-foreground/55">
                      Dibuat {formatDateTime(template.created_at)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/55">
                  Data kreator tidak tersedia.
                </p>
              )}
            </CardContent>
          </Card>

          {template.status === "rejected" && template.admin_notes ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catatan penolakan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {template.admin_notes}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tinjauan</CardTitle>
            <p className="text-xs text-foreground/55">
              Setujui untuk mempublikasikan template ke katalog, atau tolak
              dengan catatan untuk kreator.
            </p>
          </CardHeader>
          <CardContent>
            <ReviewPanel template={template} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button href="/admin/templates" variant="outline" size="sm">
          <IconArrowRight size={14} className="rotate-180" />
          Kembali ke antrean
        </Button>
      </div>
    </div>
  );
}
