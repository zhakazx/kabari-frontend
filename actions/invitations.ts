"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ApiError, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import type { FormState, Invitation } from "@/lib/types";

const GuestSchema = z.object({
  tamu_name: z.string().min(1, "Nama tamu wajib diisi").max(120),
  tamu_phone: z
    .string()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  tamu_email: z
    .string()
    .email("Email tidak valid")
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  category: z.enum(["digital", "fisik"]).default("digital"),
});

const BatchSchema = z.object({
  event_id: z.string().min(1, "Acara tidak ditemukan"),
  guests: z
    .array(GuestSchema)
    .min(1, "Tambahkan minimal satu tamu")
    .max(500, "Maksimal 500 tamu sekaligus"),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

function parseGuest(raw: unknown): { ok: true; data: z.infer<typeof GuestSchema> } | { ok: false; errors: string[] } {
  const result = GuestSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((i) => i.message),
  };
}

/**
 * Creates a batch of invitations for one event. The form sends a flat string
 * payload like:
 *   guests[0][tamu_name]=...&guests[0][category]=digital
 *   guests[1][tamu_name]=...
 * which `formDataToObject` reshapes into `{ event_id, guests: [...] }`.
 *
 * On success, returns the list of created invitations via `state.invitations`
 * so the caller can offer a "Download QR" action and a revalidate.
 */
export type InvitationBatchState = (FormState & {
  invitations?: Invitation[];
}) | undefined;

export async function createInvitationBatch(
  _state: InvitationBatchState,
  formData: FormData,
): Promise<InvitationBatchState> {
  const session = await requireRole("pelanggan");
  const eventId = String(formData.get("event_id") ?? "").trim();
  if (!eventId) return { message: "Acara tidak ditemukan" };

  const guestsRaw = formData.getAll("guests").filter((v): v is string => typeof v === "string" && v.length > 0);
  const guests: unknown[] = [];
  const guestFieldErrors: string[][] = [];
  for (const raw of guestsRaw) {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      guestFieldErrors.push(["Tamu tidak valid"]);
      continue;
    }
    const result = parseGuest(parsedJson);
    if (result.ok) {
      guests.push(result.data);
      guestFieldErrors.push([]);
    } else {
      guests.push({});
      guestFieldErrors.push(result.errors);
    }
  }

  if (guests.length === 0) {
    return { message: "Tambahkan minimal satu tamu" };
  }
  if (guestFieldErrors.some((errs) => errs.length > 0)) {
    const firstBad = guestFieldErrors.findIndex((errs) => errs.length > 0);
    return {
      message: `Tamu ke-${firstBad + 1} belum lengkap`,
      errors: { guests: guestFieldErrors.flat() },
    };
  }

  const parsed = BatchSchema.safeParse({ event_id: eventId, guests });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  let created: Invitation[];
  try {
    const result = await apiJson<Invitation[]>(
      "/invitations/batch",
      "POST",
      { event_id: parsed.data.event_id, guests: parsed.data.guests },
      session.accessToken,
    );
    created = result.data;
  } catch (err) {
    if (err instanceof ApiError) {
      return { message: err.messages.join(", ") || "Gagal membuat undangan" };
    }
    throw err;
  }

  revalidatePath(`/events/${eventId}/guests`);
  revalidatePath(`/events/${eventId}/dashboard`);

  return {
    message: `${created.length} tamu ditambahkan`,
    invitations: created,
  };
}
