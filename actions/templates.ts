"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError, apiForm, apiGet, apiJson } from "@/lib/api-client";
import { requireRole } from "@/lib/dal";
import type {
  FormState,
  Template,
  TemplateStatus,
  UpdateTemplateStatusDto,
} from "@/lib/types";

/**
 * Kreator template Server Actions. Both `createTemplate` and
 * `updateTemplate` send `multipart/form-data` because the backend stores
 * thumbnail and template_file uploads as `multipart`. The form fields are
 * validated with zod here; image / file-size limits are also enforced
 * client-side in the form for a faster UX.
 *
 * The backend enforces ownership of `PATCH /templates/{id}` itself — a
 * kreator cannot edit someone else's template (it returns 403). We re-check
 * it here as a defense in depth: load the template first, compare
 * `creator_id` with the session's `userId`, and short-circuit with a
 * friendly error before issuing the PATCH.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_THUMBNAIL_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const CreateSchema = z.object({
  name: z.string().min(2, "Nama template minimal 2 karakter").max(120),
  category: z.string().min(1, "Kategori wajib diisi").max(60),
  description: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  price: z.coerce
    .number({ message: "Harga tidak valid" })
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif"),
});

const UpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  category: z.string().min(1).max(60).optional(),
  description: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  price: z.coerce
    .number({ message: "Harga tidak valid" })
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif")
    .optional(),
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

function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function readFile(formData: FormData, key: string): File | null {
  const raw = formData.get(key);
  if (raw instanceof File && raw.size > 0) return raw;
  return null;
}

function validateThumbnail(file: File | null): string | null {
  if (!file) return "Thumbnail wajib diunggah";
  if (file.size > MAX_FILE_BYTES) return "Thumbnail melebihi 10MB";
  if (!ACCEPTED_THUMBNAIL_TYPES.includes(file.type)) {
    return "Thumbnail harus berupa gambar (JPG, PNG, WebP, atau GIF)";
  }
  return null;
}

function validateTemplateFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > MAX_FILE_BYTES) return "Berkas template melebihi 10MB";
  return null;
}

async function assertOwnership(
  templateId: string,
  ownerId: string,
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" }> {
  try {
    const { data } = await apiGet<Template>(`/templates/${templateId}`);
    if (data.creator_id !== ownerId) return { ok: false, reason: "forbidden" };
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 404) return { ok: false, reason: "not_found" };
      if (err.statusCode === 403) return { ok: false, reason: "forbidden" };
    }
    throw err;
  }
}

/**
 * Create a new template. Sends multipart to `POST /templates`. The new
 * template lands in `pending_review`. The action redirects to the edit
 * page so the kreator can keep iterating before submitting it (the
 * `submit-for-review` action lives in a separate, future iteration).
 */
export async function createTemplate(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("kreator");

  const parsed = CreateSchema.safeParse({
    name: readString(formData, "name"),
    category: readString(formData, "category"),
    description: readString(formData, "description") || undefined,
    price: readString(formData, "price"),
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const thumbnail = readFile(formData, "thumbnail");
  const templateFile = readFile(formData, "template_file");

  const thumbError = validateThumbnail(thumbnail);
  if (thumbError) return { errors: { thumbnail: [thumbError] } };
  const fileError = validateTemplateFile(templateFile);
  if (fileError) return { errors: { template_file: [fileError] } };

  const payload = new FormData();
  payload.set("name", parsed.data.name);
  payload.set("category", parsed.data.category);
  payload.set("price", String(parsed.data.price));
  if (parsed.data.description) {
    payload.set("description", parsed.data.description);
  }
  payload.set("thumbnail", thumbnail!);
  if (templateFile) payload.set("template_file", templateFile);

  let created: Template;
  try {
    const result = await apiForm<Template>(
      "/templates",
      "POST",
      payload,
      session.accessToken,
    );
    created = result.data;
  } catch (err) {
    return apiErrorToState(err);
  }

  revalidatePath("/kreator/templates");
  revalidatePath("/templates");
  redirect(`/kreator/templates/${created.id}/edit`);
}

/**
 * Update an existing template. Sends multipart to `PATCH /templates/{id}`.
 * The endpoint treats `thumbnail` / `template_file` as replace-on-send; we
 * only include them when a new file was picked. Ownership is re-checked
 * locally so we never spam the backend for non-owners.
 */
export async function updateTemplate(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireRole("kreator");
  const templateId = readString(formData, "template_id").trim();
  if (!templateId) return { message: "Template tidak ditemukan" };

  const ownership = await assertOwnership(templateId, session.userId);
  if (!ownership.ok) {
    if (ownership.reason === "not_found") {
      return { message: "Template tidak ditemukan" };
    }
    return { message: "Anda tidak dapat mengubah template milik kreator lain" };
  }

  const parsed = UpdateSchema.safeParse({
    name: readString(formData, "name") || undefined,
    category: readString(formData, "category") || undefined,
    description: readString(formData, "description") || undefined,
    price: readString(formData, "price") || undefined,
  });
  if (!parsed.success) return { errors: fieldErrorsOf(parsed.error) };

  const thumbnail = readFile(formData, "thumbnail");
  const templateFile = readFile(formData, "template_file");

  if (thumbnail) {
    const thumbError = validateThumbnail(thumbnail);
    if (thumbError) return { errors: { thumbnail: [thumbError] } };
  }
  if (templateFile) {
    const fileError = validateTemplateFile(templateFile);
    if (fileError) return { errors: { template_file: [fileError] } };
  }

  // Build a fresh FormData so we only include fields that were actually
  // touched. PATCH semantics on the backend mirror this — missing fields
  // are not modified.
  const payload = new FormData();
  if (parsed.data.name) payload.set("name", parsed.data.name);
  if (parsed.data.category) payload.set("category", parsed.data.category);
  if (parsed.data.description) {
    payload.set("description", parsed.data.description);
  }
  if (parsed.data.price !== undefined) {
    payload.set("price", String(parsed.data.price));
  }
  if (thumbnail) payload.set("thumbnail", thumbnail);
  if (templateFile) payload.set("template_file", templateFile);

  if (Array.from(payload.keys()).length === 0) {
    return { message: "Tidak ada perubahan untuk disimpan" };
  }

  try {
    await apiForm<Template>(
      `/templates/${templateId}`,
      "PATCH",
      payload,
      session.accessToken,
    );
  } catch (err) {
    return apiErrorToState(err);
  }

  revalidatePath("/kreator/templates");
  revalidatePath(`/kreator/templates/${templateId}/edit`);
  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
  return { message: "Perubahan tersimpan" };
}

const ValidateSchema = z.object({
  template_id: z.string().min(1, "Template tidak ditemukan"),
  status: z.enum(["published", "rejected"], {
    message: "Pilih hasil tinjauan",
  }),
  notes: z.string().max(2000).optional(),
});

export type ValidateTemplateState = (FormState & {
  /** Echo of the action that just ran — the form uses this to show a
   *  per-action confirmation banner that mirrors the server's intent. */
  intent?: "approve" | "reject";
  /** What the server wrote; the review page can show the new status
   *  badge immediately without revalidating. */
  status?: TemplateStatus;
}) | undefined;

/**
 * Review a template (admin only). Approve sets `status: 'published'`;
 * reject requires a `notes` payload so the kreator sees actionable
 * feedback in their studio. We don't take `notes` from a FormData field
 * the same way the schema does — the review panel splits the two flows
 * (approve / reject) into separate buttons, and a rejected submit must
 * carry the note.
 */
export async function validateTemplate(
  _state: ValidateTemplateState,
  formData: FormData,
): Promise<ValidateTemplateState> {
  const session = await requireRole("admin");

  const statusRaw = readString(formData, "status");
  if (statusRaw !== "published" && statusRaw !== "rejected") {
    return { message: "Pilih hasil tinjauan" };
  }
  const notes = readString(formData, "notes");

  const parsed = ValidateSchema.safeParse({
    template_id: readString(formData, "template_id"),
    status: statusRaw,
    notes: notes || undefined,
  });
  if (!parsed.success) {
    const errs = fieldErrorsOf(parsed.error);
    return {
      errors: errs,
      message: errs.notes?.[0] ?? "Data tinjauan tidak valid",
    };
  }

  if (parsed.data.status === "rejected" && !parsed.data.notes?.trim()) {
    return {
      errors: { notes: ["Catatan wajib diisi saat menolak template"] },
      message: "Catatan wajib diisi saat menolak template",
    };
  }

  const body: UpdateTemplateStatusDto = {
    status: parsed.data.status,
  };
  if (parsed.data.notes) body.notes = parsed.data.notes;

  try {
    await apiJson<Template>(
      `/templates/${parsed.data.template_id}/validate`,
      "PATCH",
      body,
      session.accessToken,
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        message: err.messages.join(", ") || "Gagal memperbarui tinjauan",
      };
    }
    throw err;
  }

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${parsed.data.template_id}`);
  revalidatePath("/templates");
  revalidatePath("/kreator/templates");

  return {
    message:
      parsed.data.status === "published"
        ? "Template dipublikasikan"
        : "Template ditolak dan kreator diberi catatan",
    intent: parsed.data.status === "published" ? "approve" : "reject",
    status: parsed.data.status,
  };
}
