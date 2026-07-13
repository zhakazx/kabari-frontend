import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTemplate } from "@/lib/dal-public";
import { cn, formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconArrowRight, IconLayers } from "@/components/ui/icons";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSessionOrNull } from "@/lib/dal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) {
    return { title: "Template tidak ditemukan" };
  }
  const description =
    template.description?.slice(0, 160) ??
    `Template ${template.category} oleh ${template.creator?.full_name ?? "kreator KABARI"}.`;
  return {
    title: template.name,
    description,
    openGraph: {
      title: `${template.name} · KABARI`,
      description,
      ...(template.thumbnail_url ? { images: [{ url: template.thumbnail_url }] } : {}),
    },
  };
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [{ params: { id: "00000000-0000-0000-0000-000000000000" } }],
};

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <nav className="text-xs text-foreground/55">
        <Link href="/templates" className="hover:text-foreground/80">
          Template
        </Link>
      </nav>

      <Suspense fallback={<TemplateDetailSkeleton />}>
        {params.then(({ id }) => (
          <TemplateDetail id={id} />
        ))}
      </Suspense>
    </main>
  );
}

async function TemplateDetail({ id }: { id: string }) {
  const template = await getTemplate(id);
  if (!template) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        {template.thumbnail_url ? (
          <SafeImage
            src={template.thumbnail_url}
            alt={template.name}
            className="block aspect-[4/3] w-full object-cover"
            sizes="(min-width: 1024px) 36rem, 100vw"
            priority
          />
        ) : (
          <div
            aria-hidden
            className="qr-grid flex aspect-[4/3] w-full items-center justify-center bg-surface-muted text-foreground/25"
          >
            <IconLayers size={56} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Badge variant="neutral" className="self-start">
            {template.category}
          </Badge>
          <h1 className="font-display text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl">
            {template.name}
          </h1>
          {template.creator?.full_name ? (
            <p className="text-sm text-foreground/65">
              oleh{" "}
              <span className="font-medium text-foreground/85">
                {template.creator.full_name}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex items-end gap-2 border-y border-border py-5">
          <span className="font-display text-3xl font-medium tracking-tight text-foreground">
            {formatRupiah(template.price)}
          </span>
          <span className="pb-1 text-xs text-foreground/55">
            · sekali bayar
          </span>
        </div>

        {template.description ? (
          <p className="text-sm leading-relaxed text-foreground/75">
            {template.description}
          </p>
        ) : (
          <p className="text-sm italic text-foreground/55">
            Kreator belum menambahkan deskripsi untuk template ini.
          </p>
        )}

        <Suspense fallback={<ChooseCtaSkeleton />}>
          <ChooseCta templateId={template.id} />
        </Suspense>

        <ul className="grid gap-2 rounded-lg border border-border bg-surface-muted/60 p-4 text-xs text-foreground/70">
          <li>· QR code unik untuk setiap tamu</li>
          <li>· Konfirmasi RSVP lewat tautan pribadi</li>
          <li>· Check-in di gerbang dengan pindai QR</li>
        </ul>
      </div>
    </div>
  );
}

async function ChooseCta({ templateId }: { templateId: string }) {
  const session = await getSessionOrNull();
  const isPelanggan = session?.role === "pelanggan";
  const href = isPelanggan
    ? `/dashboard/events/new?template_id=${templateId}`
    : `/register?next=${encodeURIComponent(
        `/dashboard/events/new?template_id=${templateId}`,
      )}`;
  const label = isPelanggan ? "Pilih template ini" : "Buat acara dengan ini";

  return (
    <Button href={href} size="lg" className={cn("self-start")}>
      {label}
      <IconArrowRight size={18} />
    </Button>
  );
}

function ChooseCtaSkeleton() {
  return (
    <div
      className="h-12 w-48 animate-pulse rounded-md bg-surface-muted"
      aria-hidden
    />
  );
}

function TemplateDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl border border-border bg-surface-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-5 w-20 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-20 w-full animate-pulse rounded-md bg-surface-muted" />
        <div className="h-12 w-48 animate-pulse rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}
