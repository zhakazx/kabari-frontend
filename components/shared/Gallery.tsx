"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { IconChevronDown, IconImage } from "@/components/ui/icons";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * Lightweight image gallery for the public invitation surface. The backend
 * returns gallery URLs as a JSON-encoded string in `gallery_urls`; we parse
 * defensively and fall back to an empty state when the value is missing or
 * invalid. The first image is the cover; users can step through with
 * arrows or thumbnails.
 */
export function Gallery({
  urls,
  className,
  alt = "Galeri acara",
}: {
  urls: string[] | null | undefined;
  className?: string;
  alt?: string;
}) {
  const list = (urls ?? []).filter(Boolean);
  const [active, setActive] = useState(0);

  if (list.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-muted/60 px-6 py-10 text-center text-sm text-foreground/55",
          className,
        )}
      >
        <IconImage size={22} className="text-foreground/40" aria-hidden />
        <span>Galeri belum tersedia.</span>
      </div>
    );
  }

  const safeIndex = Math.min(active, list.length - 1);
  const current = list[safeIndex];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-muted">
        <SafeImage
          src={current}
          alt={alt}
          className="block aspect-[4/3] w-full object-cover"
          sizes="(min-width: 1024px) 60rem, 100vw"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActive((i) => (i - 1 + list.length) % list.length)
              }
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/90 text-foreground/80 shadow-sm backdrop-blur transition hover:bg-surface"
            >
              <IconChevronDown size={16} className="rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % list.length)}
              aria-label="Foto berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/90 text-foreground/80 shadow-sm backdrop-blur transition hover:bg-surface"
            >
              <IconChevronDown size={16} className="-rotate-90" />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat foto ${i + 1}`}
              aria-current={i === safeIndex}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition",
                i === safeIndex
                  ? "border-accent"
                  : "border-border opacity-80 hover:opacity-100",
              )}
            >
              <SafeImage
                src={url}
                alt=""
                className="block h-full w-full object-cover"
                sizes="6rem"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
