import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconArrowRight, IconUserCheck } from "@/components/ui/icons";
import { UserForm } from "@/app/(admin)/admin/users/_components/UserForm";

export default async function NewUserPage() {
  await requireRole("admin");

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-xs text-foreground/55">
        <Link href="/admin/users" className="hover:text-foreground/80">
          Pengguna
        </Link>{" "}
        <span className="px-1 text-foreground/35">/</span> Buat baru
      </nav>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
          Pengguna baru
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          Buat akun baru
        </h1>
        <p className="max-w-2xl text-sm text-foreground/65">
          Buat akun untuk anggota tim, pelanggan, atau kreator. Setelah
          akun dibuat, Anda dapat mengubah detailnya dari halaman detail
          pengguna.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUserCheck size={18} className="text-accent" />
            Detail pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm kind="create" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button href="/admin/users" variant="outline" size="sm">
          <IconArrowRight size={14} className="rotate-180" />
          Kembali ke daftar
        </Button>
      </div>
    </div>
  );
}
