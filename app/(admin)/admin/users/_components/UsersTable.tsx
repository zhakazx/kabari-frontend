"use client";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { IconUsers } from "@/components/ui/icons";
import { DeleteUserButton } from "./DeleteUserButton";
import { ROLE_LABELS, formatDate, statusBadgeVariant } from "@/lib/utils";
import type { SafeUser } from "@/lib/types";

export function UsersTable({
  users,
  currentUserId,
}: {
  users: SafeUser[];
  currentUserId: string;
}) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={<IconUsers size={22} />}
        title="Tidak ada pengguna yang cocok"
        description="Coba ubah kata kunci atau pilih peran lain."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3 text-left first:pl-6">Nama</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left">Peran</th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">
                Dibuat
              </th>
              <th className="px-4 py-3 text-right last:pr-6">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr
                key={u.id}
                className="transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-3 align-middle first:pl-6">
                  <a
                    href={`/admin/users/${u.id}`}
                    className="flex flex-col gap-0.5"
                  >
                    <span className="font-medium text-foreground hover:text-accent">
                      {u.full_name}
                    </span>
                    <span className="text-xs text-foreground/55 md:hidden">
                      {u.email}
                    </span>
                  </a>
                </td>
                <td className="hidden px-4 py-3 align-middle md:table-cell">
                  <span className="text-sm text-foreground/75">
                    {u.email}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge variant={statusBadgeVariant(u.role)} dot>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 align-middle lg:table-cell">
                  <span className="text-xs text-foreground/65">
                    {formatDate(u.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle last:pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      href={`/admin/users/${u.id}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      Edit
                    </Button>
                    <DeleteUserButton
                      userId={u.id}
                      userName={u.full_name}
                      isSelf={u.id === currentUserId}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border bg-surface-muted/40 px-6 py-2.5 text-xs text-foreground/55">
        Menampilkan {users.length} pengguna
      </p>
    </div>
  );
}
