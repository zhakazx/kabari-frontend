import { cn } from "@/lib/utils";

type Tone = "adaptive" | "ink" | "paper";

const STAMP: Record<Tone, { fill: string; stroke: string; dot: string }> = {
  adaptive: {
    fill: "var(--primary)",
    stroke: "var(--primary-foreground)",
    dot: "var(--accent)",
  },
  ink: { fill: "#16140f", stroke: "#fbfaf6", dot: "#7a1e1e" },
  paper: { fill: "#fbfaf6", stroke: "#16140f", dot: "#7a1e1e" },
};

/**
 * KABARI seal — a wax-stamp silhouette carrying a "K" rendered as a stroked
 * mark, with a single oxblood seal-dot in the corner. `tone="adaptive"` inverts
 * with the theme; `ink`/`paper` are constant for fixed-brand surfaces.
 */
export function BrandMark({
  className,
  title = "KABARI",
  tone = "adaptive",
}: {
  className?: string;
  title?: string;
  tone?: Tone;
}) {
  const { fill, stroke, dot } = STAMP[tone];
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn("h-9 w-9", className)}
    >
      <title>{title}</title>
      <rect x="1.25" y="1.25" width="21.5" height="21.5" rx="6" fill={fill} />
      <g
        stroke={stroke}
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M8.4 5.6 V18.4" />
        <path d="M8.9 12 L16.6 5.6" />
        <path d="M8.9 12 L16.6 18.4" />
      </g>
      <rect x="15.6" y="15.6" width="5.4" height="5.4" rx="1.3" fill={dot} />
    </svg>
  );
}

/** Seal + wordmark lockup. Wordmark set in Fraunces (the display face). */
export function Wordmark({
  className,
  markClassName,
  tone = "adaptive",
  hideOnMobile = false,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  tone?: Tone;
  hideOnMobile?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark tone={tone} className={cn("h-8 w-8", markClassName)} />
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none tracking-[0.18em] font-medium",
          hideOnMobile && "hidden sm:inline",
          wordmarkClassName,
        )}
      >
        KABARI
      </span>
    </span>
  );
}
