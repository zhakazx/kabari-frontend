"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthResult, FormState } from "@/lib/types";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  full_name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["pelanggan", "kreator", "penerima_tamu", "admin"]),
});

function redirectByRole(): never {
  redirect("/dashboard");
}

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export async function login(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrorsOf(parsed.error), values: raw };
  }

  let data: AuthResult;
  try {
    const result = await apiJson<AuthResult>("/auth/login", "POST", parsed.data);
    data = result.data;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 401 || err.statusCode === 400) {
        return {
          message: "Email atau password salah",
          values: { email: raw.email },
        };
      }
      return { message: err.messages.join(", ") || "Terjadi kesalahan", values: raw };
    }
    throw err;
  }

  await createSession(data);
  redirectByRole();
}

export async function register(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrorsOf(parsed.error), values: raw };
  }

  let data: AuthResult;
  try {
    const result = await apiJson<AuthResult>(
      "/auth/register",
      "POST",
      parsed.data,
    );
    data = result.data;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 409) {
        return { message: "Email sudah terdaftar", values: { ...raw, password: "" } };
      }
      if (err.statusCode === 400) {
        return { message: "Data pendaftaran tidak valid", values: raw };
      }
      return { message: err.messages.join(", ") || "Terjadi kesalahan", values: raw };
    }
    throw err;
  }

  await createSession(data);
  redirectByRole();
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
