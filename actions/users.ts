"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import type { FormState, User } from "@/lib/types";

/**
 * Admin user management. `createUser` POSTs `CreateUserDto`, `updateUser`
 * PATCHes with the partial `UpdateUserDto`, and `deleteUser` issues a
 * `DELETE` on the resource. Each action revalidates `/admin/users` so the
 * list reflects the new state without a manual refresh.
 *
 * Self-protection: the admin can update their own record, but a self-delete
 * is rejected client-side via the `DeleteUserButton` AND server-side as a
 * defense in depth.
 */

const CreateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(120, "Nama lengkap terlalu panjang"),
  email: z.email("Email tidak valid").max(160),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(120, "Password terlalu panjang"),
  role: z.enum(["pelanggan", "kreator", "penerima_tamu", "admin"], {
    message: "Pilih peran",
  }),
});

const UpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(120, "Nama lengkap terlalu panjang")
    .optional(),
  email: z.email("Email tidak valid").max(160).optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(120, "Password terlalu panjang")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function readOptional(formData: FormData, key: string): string | undefined {
  const v = readString(formData, key);
  return v ? v : undefined;
}

function apiErrorToState(err: unknown): FormState {
  if (err instanceof ApiError) {
    return { message: err.messages.join(", ") || "Permintaan gagal" };
  }
  throw err;
}

/**
 * Create a new user. Used only by admins (the `/admin/users/new` form).
 * On `409` (email already exists) we surface a field error on `email` so
 * the form keeps the user's input intact.
 */
export async function createUser(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("admin");

  const parsed = CreateSchema.safeParse({
    full_name: readString(formData, "full_name"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    role: readString(formData, "role"),
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  let created: User;
  try {
    const { data } = await apiJson<User>(
      "/users",
      "POST",
      parsed.data,
      session.accessToken,
    );
    created = data;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 409) {
        return {
          errors: { email: ["Email sudah terdaftar"] },
        };
      }
      return { message: err.messages.join(", ") || "Gagal membuat pengguna" };
    }
    return apiErrorToState(err);
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users/${created.id}`);
}

/**
 * Update a user. Only the fields actually sent are PATCHed. An admin can
 * edit any user, including themselves — the form is identical regardless
 * of who is being edited.
 */
export async function updateUser(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("admin");
  const userId = readString(formData, "user_id");
  if (!userId) return { message: "Pengguna tidak ditemukan" };

  const parsed = UpdateSchema.safeParse({
    full_name: readOptional(formData, "full_name"),
    email: readOptional(formData, "email"),
    password: readOptional(formData, "password"),
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const body: Record<string, unknown> = {};
  if (parsed.data.full_name) body.full_name = parsed.data.full_name;
  if (parsed.data.email) body.email = parsed.data.email;
  if (parsed.data.password) body.password = parsed.data.password;

  if (Object.keys(body).length === 0) {
    return { message: "Tidak ada perubahan untuk disimpan" };
  }

  try {
    await apiJson<User>(`/users/${userId}`, "PATCH", body, session.accessToken);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 409) {
        return { errors: { email: ["Email sudah terdaftar"] } };
      }
      return {
        message: err.messages.join(", ") || "Gagal memperbarui pengguna",
      };
    }
    return apiErrorToState(err);
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { message: "Perubahan tersimpan" };
}

/**
 * Delete a user. Defense in depth: even if the UI button is hidden, the
 * server refuses to delete the calling admin's own account.
 */
export async function deleteUser(formData: FormData): Promise<void> {
  const session = await requireRole("admin");
  const userId = readString(formData, "user_id");
  if (!userId) return;

  if (userId === session.userId) {
    throw new Error("Tidak dapat menghapus akun sendiri");
  }

  try {
    await apiJson(`/users/${userId}`, "DELETE", undefined, session.accessToken);
  } catch (err) {
    if (err instanceof ApiError) {
      throw new Error(err.messages.join(", ") || "Gagal menghapus pengguna");
    }
    throw err;
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
