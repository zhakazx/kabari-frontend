import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { getCreatableTemplates } from "@/lib/dal-pelanggan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";
import { IconArrowRight, IconLayers } from "@/components/ui/icons";
import { TemplateCard } from "@/components/templates/TemplateCard";

type SearchParams = Promise<{ template_id?: string }>;

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole("pelanggan");
  const params = await searchParams;
  const { items: templates } = await getCreatableTemplates(session, {
    page: 1,
    limit: 12,
  });

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-xs text-foreground/55">
        <Link href="/events" className="hover:text-foreground/80">
          Acara
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span> Buat baru
      </nav>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Buat acara
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Mulai dengan template
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Pilih desain yang paling mendekati acara Anda, lalu isi detail di
          langkah berikutnya. Template bisa diganti kapan saja.
        </p>
      </div>

      <section
        aria-labelledby="template-picker"
        className="flex flex-col gap-4"
      >
        <h2
          id="template-picker"
          className="flex items-center gap-2 font-display text-lg font-medium tracking-tight"
        >
          <IconLayers size={18} className="text-accent" />
          Pilih template
        </h2>
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-foreground/65">
              Belum ada template yang dipublikasikan. Anda tetap bisa membuat
              acara tanpa template.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
        <p className="text-xs text-foreground/55">
          Ingin lihat lebih banyak?{" "}
          <Link
            href="/templates"
            className="font-medium text-accent hover:underline"
          >
            Buka katalog lengkap
            <IconArrowRight size={12} className="ml-0.5 inline-block" />
          </Link>
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Detail acara</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            kind="create"
            templates={templates}
            selectedTemplateId={params.template_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
