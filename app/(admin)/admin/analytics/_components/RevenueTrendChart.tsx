"use client";

import { useMemo } from "react";

import { cn, formatRupiah, toNumber } from "@/lib/utils";
import type { RevenueTrendPoint } from "@/lib/types";

/**
 * Inline SVG bar/line chart for `RevenueTrendPoint[]`. Kept as a client
 * component so we can co-locate the `useMemo` that derives the
 * viewBox from the data. The backend may return `revenue` and `orders`
 * as strings or numbers; `toNumber` handles both.
 */
export function RevenueTrendChart({
  points,
}: {
  points: RevenueTrendPoint[];
}) {
  const derived = useMemo(() => {
    const xs = points.length;
    const safePoints = points.map((p) => ({
      date: p.date,
      revenue: toNumber(p.revenue),
      orders: toNumber(p.orders),
    }));
    const maxRevenue = safePoints.reduce(
      (acc, p) => Math.max(acc, p.revenue),
      0,
    );
    const totalRevenue = safePoints.reduce((acc, p) => acc + p.revenue, 0);
    const totalOrders = safePoints.reduce((acc, p) => acc + p.orders, 0);

    return { xs, maxRevenue, totalRevenue, totalOrders, safePoints };
  }, [points]);

  if (derived.xs === 0) {
    return (
      <p className="text-sm italic text-foreground/45">
        Belum ada data untuk periode ini.
      </p>
    );
  }

  const W = 600;
  const H = 220;
  const padding = { top: 16, right: 12, bottom: 28, left: 44 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const barWidth = Math.max(2, innerW / derived.xs - 4);
  const stepX = innerW / derived.xs;

  const yTicks = computeYTicks(derived.maxRevenue);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
        <span className="text-foreground/70">
          Total{" "}
          <span className="font-display text-xl font-medium tracking-tight text-foreground">
            {formatRupiah(derived.totalRevenue)}
          </span>
        </span>
        <span className="text-foreground/70">
          Pesanan{" "}
          <span className="font-display text-xl font-medium tracking-tight text-foreground">
            {derived.totalOrders.toLocaleString("id-ID")}
          </span>
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Grafik tren pendapatan"
        >
          {/* Y gridlines + labels */}
          {yTicks.map((t) => {
            const y = padding.top + innerH * (1 - t / derived.maxRevenue || 0);
            return (
              <g key={t}>
                <line
                  x1={padding.left}
                  x2={W - padding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-foreground/45 font-mono text-[10px]"
                >
                  {shortRupiah(t)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {derived.safePoints.map((p, i) => {
            const ratio = derived.maxRevenue
              ? p.revenue / derived.maxRevenue
              : 0;
            const h = Math.max(0, innerH * ratio);
            const x = padding.left + i * stepX + (stepX - barWidth) / 2;
            const y = padding.top + innerH - h;
            return (
              <g key={`${p.date ?? "row"}-${i}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={2}
                  className={cn("fill-accent/85 transition-colors")}
                >
                  <title>
                    {p.date ?? "—"} · {formatRupiah(p.revenue)} · {p.orders.toLocaleString("id-ID")} pesanan
                  </title>
                </rect>
              </g>
            );
          })}

          {/* X axis baseline */}
          <line
            x1={padding.left}
            x2={W - padding.right}
            y1={padding.top + innerH}
            y2={padding.top + innerH}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
        </svg>
      </div>

      <p className="text-[0.7rem] text-foreground/45">
        {derived.xs} titik data · {derived.totalOrders.toLocaleString("id-ID")}{" "}
        pesanan terbayar · pendapatan kumulatif{" "}
        {formatRupiah(derived.totalRevenue)}
      </p>
    </div>
  );
}

function computeYTicks(max: number): number[] {
  if (max <= 0) return [0];
  const step = niceStep(max / 3);
  return [0, step, step * 2, step * 3].map((v) =>
    Math.min(v, max + step / 2),
  );
}

function niceStep(approx: number): number {
  if (approx <= 0) return 1;
  const exp = Math.floor(Math.log10(approx));
  const base = Math.pow(10, exp);
  const norm = approx / base;
  let nice = 1;
  if (norm < 1.5) nice = 1;
  else if (norm < 3) nice = 2;
  else if (norm < 7) nice = 5;
  else nice = 10;
  return nice * base;
}

function shortRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}jt`;
  }
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}
