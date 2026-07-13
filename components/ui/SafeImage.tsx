import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Smart image wrapper. Uses `next/image` when the URL points to a host the
 * next.config `remotePatterns` will accept (dev backend + production CDN);
 * falls back to a plain `<img>` otherwise so a misconfigured production
 * still renders thumbnails without breaking the build.
 */
export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  sizes,
  fill,
  width,
  height,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center bg-surface-muted text-foreground/30",
          fallbackClassName,
          className,
        )}
      />
    );
  }

  const isLocal = src.startsWith("/");
  const isAllowlisted = isLocal || isAllowlistedRemote(src);

  if (!isAllowlisted) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={className}
      />
    );
  }

  const imageProps: ImageProps = {
    src,
    alt,
    className,
    sizes,
    priority,
  };
  if (fill || (width === undefined && height === undefined)) {
    imageProps.fill = true;
  } else {
    if (width !== undefined) imageProps.width = width;
    if (height !== undefined) imageProps.height = height;
  }

  return <Image {...imageProps} alt={imageProps.alt} />;
}

function isAllowlistedRemote(src: string): boolean {
  try {
    const url = new URL(src);
    if (url.protocol === "http:" && url.hostname === "localhost") return true;
    if (url.protocol === "http:" && url.hostname === "127.0.0.1") return true;
    const csv = process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? "";
    const list = csv
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (list.length === 0) return false;
    return list.includes(url.hostname);
  } catch {
    return false;
  }
}
