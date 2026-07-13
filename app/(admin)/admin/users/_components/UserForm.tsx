"use client";

import { useActionState } from "react";

import { createUser, updateUser } from "@/actions/users";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck } from "@/components/ui/icons";
import { cn, ROLE_LABELS } from "@/lib/utils";
import type { FormState, SafeUser } from "@/lib/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; user: SafeUser; canChangeRole: boolean };

/**
 * Shared form for both creating a user and editing an existing one.
 * - `create`: full set of fields, password is required, role is required.
 * - `edit`: only `full_name`, `email`, and an *optional* `password`. The
 *   role is read-only (a self-elevating UI would be a security smell) and
 *   the password is left blank unless the admin wants to reset it.
 */
export function UserForm(props: Mode) {
  const isEdit = props.kind === "edit";
  const action = isEdit ? updateUser : createUser;
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const user = isEdit ? props.user : null;

  const isSuccess = state?.message
    ? /Perubahan tersimpan/.test(state.message)
    : false;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {isEdit ? <input type="hidden" name="user_id" value={user!.id} /> : null}

      {state?.message ? (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm",
            isSuccess
              ? "border-success/25 bg-success-soft text-success"
              : "border-danger/25 bg-danger-soft text-danger",
          )}
        >
          {isSuccess ? (
            <IconCheck size={16} className="mt-0.5 shrink-0" />
          ) : (
            <IconAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      <Field
        label="Nama lengkap"
        htmlFor="full_name"
        required
        error={state?.errors?.full_name}
      >
        <Input
          id="full_name"
          name="full_name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={user?.full_name ?? ""}
          invalid={!!state?.errors?.full_name}
          placeholder="Budi Santoso"
        />
      </Field>

      <Field
        label="Email"
        htmlFor="email"
        required
        error={state?.errors?.email}
        hint="Digunakan untuk login. Wajib unik di seluruh platform."
      >
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={160}
          defaultValue={user?.email ?? ""}
          invalid={!!state?.errors?.email}
          placeholder="budi@contoh.id"
          autoComplete="email"
        />
      </Field>

      <Field
        label={isEdit ? "Password baru" : "Password"}
        htmlFor="password"
        required={!isEdit}
        error={state?.errors?.password}
        hint={
          isEdit
            ? "Opsional. Isi untuk mengatur ulang password (min. 6 karakter)."
            : "Minimal 6 karakter."
        }
      >
        <Input
          id="password"
          name="password"
          type="password"
          required={!isEdit}
          minLength={6}
          maxLength={120}
          invalid={!!state?.errors?.password}
          placeholder={isEdit ? "••••••••" : "Minimal 6 karakter"}
          autoComplete={isEdit ? "new-password" : "new-password"}
        />
      </Field>

      {isEdit ? (
        <Field
          label="Peran"
          htmlFor="role_display"
          hint={
            props.canChangeRole
              ? "Peran saat ini. Ubah peran dengan membuat akun baru dengan peran berbeda."
              : "Peran tidak dapat diubah dari sini."
          }
        >
          <Input
            id="role_display"
            value={ROLE_LABELS[user!.role]}
            readOnly
            disabled
            className="capitalize"
          />
        </Field>
      ) : (
        <Field
          label="Peran"
          htmlFor="role"
          required
          error={state?.errors?.role}
          hint="Peran menentukan area aplikasi yang dapat diakses pengguna."
        >
          <Select
            id="role"
            name="role"
            required
            defaultValue="pelanggan"
            invalid={!!state?.errors?.role}
          >
            <option value="pelanggan">{ROLE_LABELS.pelanggan}</option>
            <option value="kreator">{ROLE_LABELS.kreator}</option>
            <option value="penerima_tamu">{ROLE_LABELS.penerima_tamu}</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
          </Select>
        </Field>
      )}

      <SubmitButton
        pendingText={isEdit ? "Menyimpan…" : "Membuat pengguna…"}
        className="self-start sm:self-auto"
      >
        {isEdit ? "Simpan perubahan" : "Buat pengguna"}
      </SubmitButton>
    </form>
  );
}
