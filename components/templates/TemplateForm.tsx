"use client";

import { startTransition, useActionState, useRef, useState } from "react";

import { createTemplate, updateTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck, IconClose, IconImage } from "@/components/ui/icons";
import { cn, formatRupiah } from "@/lib/utils";
import type { FormState, Template } from "@/lib/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_THUMBNAIL = "image/jpeg,image/png,image/webp,image/gif";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; template: Template };

/**
 * Form for creating or editing a kreator template. Renders the same fields
 * in both modes — the difference is in which inputs are required and what
 * the `defaultValue`s are. Multipart files are read on submit from the
 * uncontrolled `<input type="file">` and passed through to the Server
 * Action via a `FormData` payload.
 */
export function TemplateForm(props: Mode) {
  const isEdit = props.kind === "edit";
  const action = isEdit ? updateTemplate : createTemplate;
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);

  const template = isEdit ? props.template : null;

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [priceText, setPriceText] = useState(
    template ? String(template.price ?? 0) : "",
  );

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickThumbnail(file: File | null) {
    setClientError(null);
    setThumbnailPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
    if (!file) {
      setThumbnailFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setClientError(`"${file.name}" melebihi 10MB`);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setClientError(`"${file.name}" bukan gambar`);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
      return;
    }
    setThumbnailFile(file);
  }

  function pickTemplateFile(file: File | null) {
    setClientError(null);
    if (!file) {
      setTemplateFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setClientError(`"${file.name}" melebihi 10MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setTemplateFile(file);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Re-attach the picked files to the FormData before the action runs so
    // the server action can read them under the same field names. The
    // default browser form serialization skips the controlled file state.
    e.preventDefault();
    const formEl = e.currentTarget;
    const payload = new FormData(formEl);
    if (thumbnailFile) {
      payload.set("thumbnail", thumbnailFile);
    } else if (thumbInputRef.current) {
      payload.delete("thumbnail");
    }
    if (templateFile) {
      payload.set("template_file", templateFile);
    } else if (fileInputRef.current) {
      payload.delete("template_file");
    }
    startTransition(() => {
      formAction(payload);
    });
  }

  const isSuccess = state?.message ? /Perubahan tersimpan/.test(state.message) : false;
  const bannerMessage = clientError ?? state?.message;
  const previewSrc = thumbnailPreview ?? template?.thumbnail_url ?? null;
  const currentFileLabel = templateFile
    ? templateFile.name
    : template?.file_url
      ? "Berkas tersimpan"
      : "Belum ada berkas";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {isEdit ? <input type="hidden" name="template_id" value={template!.id} /> : null}

      {bannerMessage ? (
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
          <p>{bannerMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <Field
            label="Nama template"
            htmlFor="name"
            required
            error={state?.errors?.name}
            hint="Nama yang dilihat pelanggan di katalog."
          >
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={template?.name ?? ""}
              invalid={!!state?.errors?.name}
              placeholder="Elegan · Sage"
            />
          </Field>

          <Field
            label="Kategori"
            htmlFor="category"
            required
            error={state?.errors?.category}
            hint="Mis. wedding, ulang-tahun, aqiqah, corporate."
          >
            <Input
              id="category"
              name="category"
              required
              maxLength={60}
              defaultValue={template?.category ?? ""}
              invalid={!!state?.errors?.category}
              placeholder="wedding"
            />
          </Field>

          <Field
            label="Deskripsi"
            htmlFor="description"
            error={state?.errors?.description}
            hint="Ceritakan gaya template dalam 2–3 kalimat."
          >
            <Textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={template?.description ?? ""}
              invalid={!!state?.errors?.description}
              placeholder="Palet sage dan krem, tipografi serif, ilustrasi daun zaitun…"
            />
          </Field>

          <Field
            label="Harga"
            htmlFor="price"
            required
            error={state?.errors?.price}
            hint={
              priceText && !Number.isNaN(Number(priceText))
                ? `Ditampilkan sebagai ${formatRupiah(Number(priceText))}.`
                : "Bilangan bulat dalam rupiah. 0 berarti gratis."
            }
          >
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground/55"
              >
                Rp
              </span>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                required
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                invalid={!!state?.errors?.price}
                className="pl-9"
                placeholder="0"
              />
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <Field
            label="Thumbnail"
            htmlFor="thumbnail"
            required={!isEdit}
            error={state?.errors?.thumbnail}
            hint={
              isEdit
                ? "Opsional — unggah untuk mengganti thumbnail saat ini."
                : "JPG, PNG, WebP, atau GIF · maksimal 10MB."
            }
          >
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-muted/40",
                  previewSrc && "border-solid border-border",
                )}
              >
                {previewSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewSrc}
                    alt="Pratinjau thumbnail"
                    className="block h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-foreground/45">
                    <IconImage size={28} />
                    <span className="text-xs">Belum ada thumbnail</span>
                  </div>
                )}
                {thumbnailFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      pickThumbnail(null);
                      if (thumbInputRef.current) thumbInputRef.current.value = "";
                    }}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-foreground/70 transition hover:text-foreground"
                    aria-label="Hapus thumbnail yang dipilih"
                  >
                    <IconClose size={14} />
                  </button>
                ) : null}
              </div>
              <label
                htmlFor="thumbnail"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground/85 transition hover:bg-surface-muted"
              >
                {thumbnailFile
                  ? "Ganti thumbnail"
                  : isEdit
                    ? "Ganti thumbnail"
                    : "Pilih gambar"}
              </label>
              <input
                id="thumbnail"
                ref={thumbInputRef}
                type="file"
                name="thumbnail"
                accept={ACCEPTED_THUMBNAIL}
                className="sr-only"
                onChange={(e) =>
                  pickThumbnail(e.target.files?.[0] ?? null)
                }
              />
            </div>
          </Field>

          <Field
            label="Berkas template"
            htmlFor="template_file"
            error={state?.errors?.template_file}
            hint="Opsional · PDF/ZIP/PSD/AI · maksimal 10MB. Pelanggan akan menerima berkas ini setelah pembelian."
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs">
                <span
                  className={cn(
                    "truncate",
                    templateFile
                      ? "text-foreground"
                      : "text-foreground/55",
                  )}
                >
                  {currentFileLabel}
                </span>
                {(templateFile || template?.file_url) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-foreground/55 transition hover:text-foreground"
                    aria-label="Hapus pilihan berkas"
                  >
                    <IconClose size={14} />
                  </button>
                ) : null}
              </div>
              <label
                htmlFor="template_file"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground/85 transition hover:bg-surface-muted"
              >
                {templateFile ? "Ganti berkas" : "Pilih berkas"}
              </label>
              <input
                id="template_file"
                ref={fileInputRef}
                type="file"
                name="template_file"
                className="sr-only"
                onChange={(e) =>
                  pickTemplateFile(e.target.files?.[0] ?? null)
                }
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
        <Button
          href={isEdit ? "/kreator/templates" : "/kreator/templates"}
          variant="ghost"
          size="sm"
        >
          Batal
        </Button>
        <SubmitButton
          pendingText={isEdit ? "Menyimpan…" : "Mengirim untuk tinjauan…"}
          size="md"
        >
          {isEdit ? "Simpan perubahan" : "Kirim untuk ditinjau"}
        </SubmitButton>
      </div>
    </form>
  );
}
