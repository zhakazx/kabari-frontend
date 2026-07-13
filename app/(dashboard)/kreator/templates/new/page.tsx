import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { IconLayers } from "@/components/ui/icons";

export default async function NewTemplatePage() {
  await requireRole("kreator");

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-xs text-foreground/55">
        <Link href="/kreator/templates" className="hover:text-foreground/80">
          Template
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span> Buat baru
      </nav>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Template baru
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Rancang template pertama Anda
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Isi detail, unggah thumbnail, dan kirim untuk ditinjau tim KABARI.
          Setelah disetujui, template akan tampil di katalog publik dan mulai
          menghasilkan royalti.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLayers size={18} className="text-accent" />
            Detail template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateForm kind="create" />
        </CardContent>
      </Card>
    </div>
  );
}
