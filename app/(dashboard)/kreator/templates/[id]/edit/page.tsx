import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getTemplate } from "@/lib/dal-public";
import { TEMPLATE_STATUS_LABELS, statusBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { IconAlert, IconArrowRight, IconLayers } from "@/components/ui/icons";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("kreator");
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  if (template.creator_id !== session.userId) {
    return <NotOwner />;
  }

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-xs text-foreground/55">
        <Link href="/kreator/templates" className="hover:text-foreground/80">
          Template
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span>{" "}
        <span className="text-foreground/80">{template.name}</span>
      </nav>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(template.status)} dot>
            {TEMPLATE_STATUS_LABELS[template.status]}
          </Badge>
          {template.status === "published" ? (
            <span className="text-xs text-foreground/55">
              · Template ini sudah dipublikasikan. Perubahan thumbnail akan
              langsung tampil di katalog.
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {template.name}
        </h1>
      </div>

      {template.status === "rejected" && template.admin_notes ? (
        <div className="flex items-start gap-3 rounded-lg border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlert size={18} className="mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Catatan tim KABARI
            </span>
            <p className="leading-relaxed">{template.admin_notes}</p>
          </div>
        </div>
      ) : null}

      {template.status === "pending_review" ? (
        <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-foreground/80">
          <IconAlert size={18} className="mt-0.5 shrink-0 text-warning" />
          <p className="leading-relaxed">
            Template ini sedang ditinjau. Anda masih bisa memperbarui detail
            dan thumbnail; perubahan akan terlihat setelah tim selesai
            meninjaunya.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLayers size={18} className="text-accent" />
            Detail template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateForm kind="edit" template={template} />
        </CardContent>
      </Card>
    </div>
  );
}

function NotOwner() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="font-display text-lg font-medium text-foreground">
          Anda tidak memiliki akses ke template ini
        </p>
        <p className="max-w-sm text-sm text-foreground/65">
          Template ini milik kreator lain. Silakan kembali ke daftar template
          Anda.
        </p>
        <Button href="/kreator/templates" size="sm" className="mt-2">
          Kembali ke template saya
          <IconArrowRight size={14} />
        </Button>
      </CardContent>
    </Card>
  );
}
