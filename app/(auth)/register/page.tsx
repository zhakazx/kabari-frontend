"use client";

import { useActionState, useState } from "react";

import { register } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert } from "@/components/ui/icons";

const ROLES: UserRole[] = ["pelanggan", "kreator", "penerima_tamu", "admin"];

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(register, undefined);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("pelanggan");

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-foreground">
          Buat akun
        </h1>
        <p className="text-sm text-foreground/60">
          Daftar untuk mulai membuat undangan digital.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        {state?.message && (
          <div key={state.message} className="shake-error flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <IconAlert size={16} className="mt-0.5 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}

        <Field
          label="Nama Lengkap"
          htmlFor="full_name"
          required
          error={state?.errors?.full_name}
        >
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            invalid={!!state?.errors?.full_name}
            placeholder="Nama Anda"
            disabled={isPending}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={state?.errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!state?.errors?.email}
            placeholder="nama@email.com"
            disabled={isPending}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          required
          error={state?.errors?.password}
          hint="Minimal 6 karakter."
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!state?.errors?.password}
            placeholder="••••••••"
            disabled={isPending}
          />
        </Field>

        <Field label="Peran" htmlFor="role" required error={state?.errors?.role}>
          <Select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isPending}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>

        <SubmitButton pendingText="Membuat akun…">Daftar</SubmitButton>
      </form>

      <p className="text-sm text-foreground/60">
        Sudah punya akun?{" "}
        <Button
          href="/login"
          variant="ghost"
          size="sm"
          className="-ml-2 px-2 font-medium text-accent underline-offset-2 hover:underline"
        >
          Masuk
        </Button>
      </p>
    </div>
  );
}
