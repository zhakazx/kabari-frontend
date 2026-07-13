import Link from "next/link";
import { Suspense } from "react";

import { requireRole } from "@/lib/dal";
import { getUsers } from "@/lib/dal-admin";
import type { AdminUsersQuery } from "@/lib/dal-admin";
import { ROLE_LABELS, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination, buildHref } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { IconArrowRight, IconPlus, IconUsers } from "@/components/ui/icons";
import { UsersTable } from "@/app/(admin)/admin/users/_components/UsersTable";
import type { UserRole } from "@/lib/types";

const PAGE_SIZE = 20;

const ROLE_CHIPS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "admin", label: "Admin" },
  { value: "pelanggan", label: "Pelanggan" },
  { value: "kreator", label: "Kreator" },
  { value: "penerima_tamu", label: "Penerima Tamu" },
];

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const roleParam = params.role as string | undefined;
  const role = roleParam && roleParam !== "all" ? (roleParam as UserRole) : undefined;
  const keyword = typeof params.keyword === "string" ? params.keyword.trim() || undefined : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
            Admin · Pengguna
          </p>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Daftar pengguna
          </h1>
          <p className="max-w-2xl text-sm text-foreground/65">
            Kelola akun pelanggan, kreator, penerima tamu, dan administrator
            KABARI dari satu tempat.
          </p>
        </div>
        <Button href="/admin/users/new" size="md">
          <IconPlus size={16} />
          Tambah pengguna
        </Button>
      </div>

      <Suspense fallback={<UsersFallback />}>
        <UsersIsland
          page={page}
          role={role}
          roleParam={roleParam}
          keyword={keyword}
          searchParams={params}
        />
      </Suspense>
    </div>
  );
}

async function UsersIsland({
  page,
  role,
  roleParam,
  keyword,
  searchParams,
}: {
  page: number;
  role: UserRole | undefined;
  roleParam: string | undefined;
  keyword: string | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await requireRole("admin");

  const query: AdminUsersQuery = { page, limit: PAGE_SIZE, keyword, role };
  const { items, meta, counts } = await getUsers(session, query);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total" value={meta.total} />
        <SummaryCard label={ROLE_LABELS.admin} value={counts.admin} />
        <SummaryCard label={ROLE_LABELS.pelanggan} value={counts.pelanggan} />
        <SummaryCard label={ROLE_LABELS.kreator} value={counts.kreator} />
        <SummaryCard label={ROLE_LABELS.penerima_tamu} value={counts.penerima_tamu} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                <IconUsers size={18} className="text-accent" />
                Semua pengguna
              </CardTitle>
              <p className="text-xs text-foreground/55">
                Klik baris untuk membuka detail dan mengedit akun.
              </p>
            </div>
            <Link
              href="/admin/users/new"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              Tambah baru
              <IconArrowRight size={12} />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="group"
                aria-label="Filter peran"
                className="flex flex-wrap items-center gap-2"
              >
                {ROLE_CHIPS.map((chip) => {
                  const isActive =
                    chip.value === "all"
                      ? roleParam === undefined || roleParam === "all"
                      : roleParam === chip.value;
                  return (
                    <Link
                      key={chip.value}
                      href={buildHref(searchParams, {
                        role: isActive ? undefined : chip.value,
                        page: undefined,
                      })}
                      aria-pressed={isActive}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition",
                        isActive
                          ? "border-ink/0 bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-surface text-foreground/75 hover:bg-surface-muted",
                      )}
                    >
                      {chip.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums",
                          isActive
                            ? "bg-white/15 text-primary-foreground/85"
                            : "bg-surface-muted text-foreground/55",
                        )}
                      >
                        {counts[chip.value] ?? meta.total}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <SearchInput
                paramName="keyword"
                placeholder="Cari nama atau email…"
                className="w-full sm:max-w-xs"
              />
            </div>

            <UsersTable users={items} currentUserId={session.userId} />

            {meta.total_pages > 1 && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-foreground/55">
                  {meta.total} pengguna · halaman {meta.page} dari{" "}
                  {meta.total_pages}
                  {keyword ? ` · "${keyword}"` : ""}
                </p>
                <Pagination
                  page={page}
                  totalPages={meta.total_pages}
                  searchParams={searchParams}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-[0.18em] text-foreground/55">
          {label}
        </span>
        <span className="font-display text-2xl font-medium tracking-tight">
          {value.toLocaleString("id-ID")}
        </span>
      </CardContent>
    </Card>
  );
}

function UsersFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <Skeleton className="h-9 w-72" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
