"use client";

import { useMemo, useState } from "react";

import { cn, formatDateTime, statusBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  IconCalendar,
  IconClipboardCheck,
  IconDownload,
  IconUsers,
} from "@/components/ui/icons";
import type { CheckIn, CheckInMethod } from "@/lib/types";

const METHOD_LABELS: Record<CheckInMethod, string> = {
  qr_scan: "QR Scan",
  manual: "Manual",
};

type DateFilter = "today" | "all";

/**
 * Renders the check-in history for the supplied event. The full list is
 * passed in from the server; we filter on the client (the spec has no
 * backend support for date/operator narrowing, only the eventId). The
 * CSV export runs entirely in the browser as well.
 */
export function GateHistoryTable({ items }: { items: CheckIn[] }) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");

  const operators = useMemo(() => {
    const set = new Map<string, string>();
    for (const c of items) {
      const id = c.checked_in_by;
      const name = c.checked_in_by_user?.full_name?.trim() || id.slice(0, 8);
      if (!set.has(id)) set.set(id, name);
    }
    return Array.from(set.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (dateFilter === "today" && !isToday(c.checked_in_at)) return false;
      if (operatorFilter !== "all" && c.checked_in_by !== operatorFilter)
        return false;
      return true;
    });
  }, [items, dateFilter, operatorFilter]);

  const uniqueGuests = useMemo(() => {
    const ids = new Set<string>();
    for (const c of filtered) ids.add(c.invitation_id);
    return ids.size;
  }, [filtered]);

  const handleExport = () => {
    const rows = filtered.map((c) => [
      c.checked_in_at,
      c.invitation?.tamu_name ?? c.invitation_id,
      c.checked_in_by_user?.full_name?.trim() || c.checked_in_by,
      METHOD_LABELS[c.method] ?? c.method,
    ]);
    const header = ["Waktu", "Tamu", "Operator", "Metode"];
    const csv = [header, ...rows]
      .map((cols) => cols.map(csvField).join(","))
      .join("\r\n");
    // BOM keeps Excel from mangling UTF-8 names.
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-checkin-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={<IconClipboardCheck size={15} />}
          label="Total check-in"
          value={filtered.length}
          tone="success"
        />
        <StatTile
          icon={<IconUsers size={15} />}
          label="Tamu unik"
          value={uniqueGuests}
        />
        <StatTile
          icon={<IconUsers size={15} />}
          label="Operator aktif"
          value={operators.length}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="date-filter"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55"
                >
                  Tanggal
                </label>
                <Select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-40"
                >
                  <option value="today">Hari ini</option>
                  <option value="all">Semua</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="operator-filter"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55"
                >
                  Operator
                </label>
                <Select
                  id="operator-filter"
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-52"
                  disabled={operators.length === 0}
                >
                  <option value="all">Semua operator</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              <IconDownload size={14} />
              Unduh CSV
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<IconCalendar size={22} />}
              title="Belum ada check-in"
              description={
                dateFilter === "today"
                  ? "Belum ada tamu yang check-in hari ini. Pindai QR di halaman sebelumnya untuk mulai mencatat."
                  : "Belum ada tamu yang sesuai dengan filter saat ini."
              }
            />
          ) : (
            <HistoryTable items={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTable({ items }: { items: CheckIn[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Table>
        <THead>
          <TR>
            <TH>Waktu</TH>
            <TH>Tamu</TH>
            <TH className="hidden sm:table-cell">Operator</TH>
            <TH>Metode</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((c) => {
            const guest = c.invitation?.tamu_name ?? c.invitation_id;
            const operator =
              c.checked_in_by_user?.full_name?.trim() || c.checked_in_by;
            return (
              <TR key={c.id}>
                <TD>
                  <span className="font-mono text-xs text-foreground/80">
                    {formatDateTime(c.checked_in_at)}
                  </span>
                </TD>
                <TD>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {guest}
                    </span>
                    <span className="text-[0.7rem] text-foreground/45 sm:hidden">
                      oleh {operator}
                    </span>
                  </div>
                </TD>
                <TD className="hidden sm:table-cell">
                  <span className="text-sm text-foreground/80">{operator}</span>
                </TD>
                <TD>
                  <Badge variant={statusBadgeVariant(c.method === "qr_scan" ? "sukses" : "neutral")} dot>
                    {METHOD_LABELS[c.method] ?? c.method}
                  </Badge>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "neutral" | "success";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-5">
        <div className="flex items-center justify-between text-sm text-foreground/65">
          <span>{label}</span>
          <span aria-hidden className="text-foreground/40">
            {icon}
          </span>
        </div>
        <span
          className={cn(
            "font-display text-2xl font-medium tracking-tight",
            tone === "success" ? "text-success" : "text-foreground",
          )}
        >
          {value.toLocaleString("id-ID")}
        </span>
      </CardContent>
    </Card>
  );
}

function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
