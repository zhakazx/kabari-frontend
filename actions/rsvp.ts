"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import type { FormState, RsvpConfirmation } from "@/lib/types";

const RsvpSchema = z.object({
  rsvp_status: z.enum(["hadir", "tidak_hadir"]),
  jumlah_hadir: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

/**
 * Public RSVP Server Action. No `verifySession()` — the guest confirms via
 * the QR token alone. We POST to `/rsvp/{token}` because that endpoint
 * persists an `RsvpConfirmation` record and broadcasts a dashboard update;
 * `PATCH /invitations/{token}/rsvp` only updates the invitation.
 */
export async function submitRsvp(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { message: "Token undangan tidak valid" };

  const parsed = RsvpSchema.safeParse({
    rsvp_status: formData.get("rsvp_status"),
    jumlah_hadir: formData.get("jumlah_hadir") ?? undefined,
    message: formData.get("message") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const body: Record<string, unknown> = {
    rsvp_status: parsed.data.rsvp_status,
  };
  if (parsed.data.rsvp_status === "hadir") {
    body.jumlah_hadir = parsed.data.jumlah_hadir;
    if (parsed.data.message) body.message = parsed.data.message;
  }

  try {
    const result = await apiJson<RsvpConfirmation>(
      `/rsvp/${token}`,
      "POST",
      body,
    );
    void result;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 404) {
        return { message: "Undangan tidak ditemukan" };
      }
      if (err.statusCode === 403) {
        return { message: "Acara belum aktif" };
      }
      if (err.statusCode === 400) {
        return {
          message: err.messages.join(", ") || "Data RSVP tidak valid",
        };
      }
      return { message: err.messages.join(", ") || "Gagal mengirim RSVP" };
    }
    throw err;
  }

  redirect(`/invite/${token}?rsvp=done`);
}
