import Link from "next/link";

import { cn, formatRupiah } from "@/lib/utils";
import type { Template } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { IconLayers } from "@/components/ui/icons";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * A card previewing one published template. The whole card is a `<Link>` so
 * it's clickable; the inner visual is intentionally simple (cover, name,
 * category chip, price, creator) so a 12-up grid still feels like a catalog
 * rather than a wall of images.
 */
export function TemplateCard({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  const href = `/templates/${template.id}`;
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {template.thumbnail_url ? (
          <SafeImage
            src={template.thumbnail_url}
            alt={template.name}
            className="block h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div
            aria-hidden
            className="qr-grid flex h-full w-full items-center justify-center bg-surface-muted text-foreground/25"
          >
            <IconLayers size={42} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="neutral" className="bg-surface/90 backdrop-blur">
            {template.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-1 font-display text-base font-medium tracking-tight text-foreground">
            {template.name}
          </h3>
          {template.creator?.full_name ? (
            <span className="line-clamp-1 text-xs text-foreground/55">
              oleh {template.creator.full_name}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="font-display text-lg font-medium tracking-tight text-foreground">
            {formatRupiah(template.price)}
          </span>
          <span className="text-xs font-medium text-foreground/50 transition group-hover:text-accent">
            Lihat →
          </span>
        </div>
      </div>
    </Link>
  );
}
