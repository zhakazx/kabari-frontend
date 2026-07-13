"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiForm, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import type {
  Event,
  FormState,
  GalleryUploadResult,
} from "@/lib/types";

const EVENT_DATE_MIN_YEAR = 2000;
const EVENT_DATE_MAX_YEAR = 2100;

const EventDateSchema = z
  .string()
  .min(1, "Tanggal acara wajib diisi")
  .refine(
    (raw) => !Number.isNaN(new Date(raw).getTime()),
    "Format tanggal tidak valid",
  )
  .refine((raw) => {
    const d = new Date(raw);
    const y = d.getFullYear();
    return y >= EVENT_DATE_MIN_YEAR && y <= EVENT_DATE_MAX_YEAR;
  }, "Tahun tanggal tidak wajar");

const CreateSchema = z.object({
  event_name: z.string().min(2, "Nama acara minimal 2 karakter"),
  event_date: EventDateSchema,
  venue_name: z.string().min(2, "Nama tempat wajib diisi"),
  venue_address: z.string().optional(),
  maps_url: z
    .string()
    .url("URL peta tidak valid")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  template_id: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const UpdateSchema = z.object({
  event_name: z.string().min(2).optional(),
  event_date: z
    .string()
    .refine(
      (raw) => !Number.isNaN(new Date(raw).getTime()),
      "Format tanggal tidak valid",
    )
    .optional(),
  venue_name: z.string().min(2).optional(),
  venue_address: z.string().optional(),
  maps_url: z
    .string()
    .url("URL peta tidak valid")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: z.enum(["draft", "active", "completed", "cancelled"]).optional(),
});

function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

function apiErrorToState(err: unknown): FormState {
  if (err instanceof ApiError) {
    return { message: err.messages.join(", ") || "Permintaan gagal" };
  }
  throw err;
}

function toIso(raw: string): string {
  return new Date(raw).toISOString();
}

function readEventId(formData: FormData): string {
  return String(formData.get("event_id") ?? "").trim();
}

export async function createEvent(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("pelanggan");

  const parsed = CreateSchema.safeParse({
    event_name: formData.get("event_name"),
    event_date: formData.get("event_date"),
    venue_name: formData.get("venue_name"),
    venue_address: formData.get("venue_address") ?? undefined,
    maps_url: formData.get("maps_url") ?? undefined,
    template_id: formData.get("template_id") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const body: Record<string, unknown> = {
    event_name: parsed.data.event_name,
    event_date: toIso(parsed.data.event_date),
    venue_name: parsed.data.venue_name,
  };
  if (parsed.data.venue_address) body.venue_address = parsed.data.venue_address;
  if (parsed.data.maps_url) body.maps_url = parsed.data.maps_url;
  if (parsed.data.template_id) body.template_id = parsed.data.template_id;

  let created: Event;
  try {
    const result = await apiJson<Event>("/events", "POST", body, session.accessToken);
    created = result.data;
  } catch (err) {
    return apiErrorToState(err);
  }

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect(`/events/${created.id}`);
}

export async function updateEvent(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("pelanggan");
  const eventId = readEventId(formData);
  if (!eventId) return { message: "Acara tidak ditemukan" };

  const parsed = UpdateSchema.safeParse({
    event_name: formData.get("event_name") ?? undefined,
    event_date: formData.get("event_date") ?? undefined,
    venue_name: formData.get("venue_name") ?? undefined,
    venue_address: formData.get("venue_address") ?? undefined,
    maps_url: formData.get("maps_url") ?? undefined,
    status: formData.get("status") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const body: Record<string, unknown> = {};
  if (parsed.data.event_name) body.event_name = parsed.data.event_name;
  if (parsed.data.event_date) body.event_date = toIso(parsed.data.event_date);
  if (parsed.data.venue_name) body.venue_name = parsed.data.venue_name;
  if (parsed.data.venue_address) body.venue_address = parsed.data.venue_address;
  if (parsed.data.maps_url) body.maps_url = parsed.data.maps_url;
  if (parsed.data.status) body.status = parsed.data.status;

  if (Object.keys(body).length === 0) {
    return { message: "Tidak ada perubahan untuk disimpan" };
  }

  try {
    await apiJson<Event>(`/events/${eventId}`, "PATCH", body, session.accessToken);
  } catch (err) {
    return apiErrorToState(err);
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { message: "Perubahan tersimpan" };
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const session = await requireRole("pelanggan");
  const eventId = readEventId(formData);
  if (!eventId) return;

  try {
    await apiJson(`/events/${eventId}`, "DELETE", undefined, session.accessToken);
  } catch (err) {
    if (err instanceof ApiError) {
      // Surface via the form message after a revalidate. The caller uses a
      // server action button so the user will see the toast.
      throw new Error(err.messages.join(", ") || "Gagal menghapus acara");
    }
    throw err;
  }

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}

export async function uploadGallery(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("pelanggan");
  const eventId = readEventId(formData);
  if (!eventId) return { message: "Acara tidak ditemukan" };

  const files = formData.getAll("gallery");
  const list = files.filter(
    (f): f is File => f instanceof File && f.size > 0,
  );

  if (list.length === 0) return { message: "Pilih minimal satu gambar" };
  if (list.length > 10) return { message: "Maksimal 10 gambar sekaligus" };
  for (const f of list) {
    if (f.size > 10 * 1024 * 1024) {
      return { message: `"${f.name}" melebihi 10MB` };
    }
  }

  const upload = new FormData();
  for (const f of list) upload.append("gallery", f);

  try {
    await apiForm<GalleryUploadResult>(
      `/events/${eventId}/gallery`,
      "POST",
      upload,
      session.accessToken,
    );
  } catch (err) {
    return apiErrorToState(err);
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/gallery`);
  return { message: "Galeri diperbarui" };
}
