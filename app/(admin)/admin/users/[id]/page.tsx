import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { getUser } from "@/lib/dal-admin";
import {
  ROLE_LABELS,
  formatDateTime,
  statusBadgeVariant,
} from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IconArrowRight, IconUserCheck } from "@/components/ui/icons";
import { UserForm } from "@/app/(admin)/admin/users/_components/UserForm";
import { DeleteUserButton } from "@/app/(admin)/admin/users/_components/DeleteUserButton";

/**
 * Admin → User detail / edit. The page is admin-gated by the `(admin)`
 * layout's `requireRole('admin')`; the per-user data is fetched by id
 * and rendered with the same edit form the create page uses, plus a
 * self-protection delete button.
 */
export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("admin");
  const { id } = await params;
  const user = await getUser(session, id);
  if (!user) notFound();

  const isSelf = user.id === session.userId;

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-foreground/55">
        <Link href="/admin/users" className="hover:text-foreground/80">
          Pengguna
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span>{" "}
        <span className="text-foreground/80">{user.full_name}</span>
      </nav>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(user.role)} dot>
            {ROLE_LABELS[user.role]}
          </Badge>
          {isSelf ? (
            <span className="text-xs text-foreground/55">
              · Akun Anda sendiri
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {user.full_name}
        </h1>
        <p className="text-sm text-foreground/65">{user.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUserCheck size={18} className="text-accent" />
              Ringkasan akun
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.full_name} size="lg" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-medium text-foreground">
                  {user.full_name}
                </span>
                <span className="text-xs text-foreground/60">{user.email}</span>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Peran"
                value={
                  <Badge variant={statusBadgeVariant(user.role)} dot>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                }
              />
              <Field label="ID" value={<Mono>{user.id}</Mono>} />
              <Field
                label="Dibuat"
                value={formatDateTime(user.created_at)}
              />
              {user.updated_at ? (
                <Field
                  label="Diperbarui"
                  value={formatDateTime(user.updated_at)}
                />
              ) : null}
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <span className="text-xs text-foreground/55">
                {isSelf
                  ? "Akun Anda tidak dapat dihapus."
                  : "Hapus akun akan menghapus semua data terkait."}
              </span>
              <DeleteUserButton
                userId={user.id}
                userName={user.full_name}
                isSelf={isSelf}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit pengguna</CardTitle>
            <p className="text-xs text-foreground/55">
              Peran tidak dapat diubah. Buat akun baru untuk mengganti
              peran.
            </p>
          </CardHeader>
          <CardContent>
            <UserForm
              kind="edit"
              user={user}
              canChangeRole={!isSelf}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button href="/admin/users" variant="outline" size="sm">
          <IconArrowRight size={14} className="rotate-180" />
          Kembali ke daftar
        </Button>
        <Button
          href={`/admin/users/new`}
          variant="ghost"
          size="sm"
        >
          Buat pengguna lain
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="block max-w-full truncate font-mono text-xs text-foreground/75">
      {children}
    </span>
  );
}
