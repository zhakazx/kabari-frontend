"use client";

import { useActionState, useState } from "react";

import { login } from "@/lib/auth";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert } from "@/components/ui/icons";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-foreground">
          Masuk
        </h1>
        <p className="text-sm text-foreground/60">
          Masuk ke akun KABARI Anda.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        {state?.message && (
          <div key={state.message} className="shake-error flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <IconAlert size={16} className="mt-0.5 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}

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
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!state?.errors?.password}
            placeholder="••••••••"
            disabled={isPending}
          />
        </Field>

        <SubmitButton pendingText="Memproses…">Masuk</SubmitButton>
      </form>

      <p className="text-sm text-foreground/60">
        Belum punya akun?{" "}
        <Button
          href="/register"
          variant="ghost"
          size="sm"
          className="-ml-2 px-2 font-medium text-accent underline-offset-2 hover:underline"
        >
          Daftar
        </Button>
      </p>
    </div>
  );
}
