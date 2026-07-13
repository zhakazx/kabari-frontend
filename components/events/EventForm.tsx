"use client";

import { useActionState } from "react";

import { createEvent, updateEvent } from "@/actions/events";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert } from "@/components/ui/icons";
import type { Event, Template } from "@/lib/types";

/**
 * Converts an ISO datetime string to a value suitable for `<input
 * type="datetime-local">` (local time, no timezone, `YYYY-MM-DDTHH:mm`).
 * Returns an empty string when the source is missing or invalid so the
 * field renders blank rather than "Invalid Date".
 */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // en-CA gives us `YYYY-MM-DD`; we then add the HH:mm slice from the local date.
  const ymd = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const hm = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${ymd}T${hm}`;
}

type Mode =
  | { kind: "create"; templates: Template[]; selectedTemplateId?: string }
  | { kind: "edit"; event: Event };

export function EventForm(props: Mode) {
  const action = props.kind === "create" ? createEvent : updateEvent;
  const [state, formAction] = useActionState(action, undefined);

  const isEdit = props.kind === "edit";
  const event = isEdit ? props.event : undefined;
  const templates = isEdit ? [] : props.templates;
  const selectedTemplateId = isEdit
    ? (event?.template_id ?? "")
    : (props.selectedTemplateId ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {isEdit ? <input type="hidden" name="event_id" value={event?.id ?? ""} /> : null}

      {state?.message ? (
        <div
          className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm ${
            isSuccessMessage(state.message)
              ? "border-success/25 bg-success-soft text-success"
              : "border-danger/25 bg-danger-soft text-danger"
          }`}
        >
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {!isEdit && templates.length > 0 ? (
        <Field
          label="Template"
          htmlFor="template_id"
          hint="Pilih desain yang ingin dipakai. Bisa diganti belakangan."
        >
          <Select id="template_id" name="template_id" defaultValue={selectedTemplateId}>
            <option value="">— Tanpa template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.category}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field
        label="Nama acara"
        htmlFor="event_name"
        required
        error={state?.errors?.event_name}
      >
        <Input
          id="event_name"
          name="event_name"
          required
          defaultValue={event?.event_name ?? ""}
          invalid={!!state?.errors?.event_name}
          placeholder="Pernikahan Andi & Sari"
        />
      </Field>

      <Field
        label="Tanggal &amp; waktu"
        htmlFor="event_date"
        required
        error={state?.errors?.event_date}
        hint="Zona waktu mengikuti peramban Anda."
      >
        <Input
          id="event_date"
          name="event_date"
          type="datetime-local"
          required
          defaultValue={toLocalInput(event?.event_date)}
          invalid={!!state?.errors?.event_date}
        />
      </Field>

      <Field
        label="Nama tempat"
        htmlFor="venue_name"
        required
        error={state?.errors?.venue_name}
      >
        <Input
          id="venue_name"
          name="venue_name"
          required
          defaultValue={event?.venue_name ?? ""}
          invalid={!!state?.errors?.venue_name}
          placeholder="Gedong Sutra"
        />
      </Field>

      <Field
        label="Alamat tempat"
        htmlFor="venue_address"
        error={state?.errors?.venue_address}
        hint="Opsional — akan tampil di undangan publik."
      >
        <Textarea
          id="venue_address"
          name="venue_address"
          defaultValue={event?.venue_address ?? ""}
          invalid={!!state?.errors?.venue_address}
          placeholder="Jl. Merdeka No. 17, Jakarta Pusat"
        />
      </Field>

      <Field
        label="Tautan peta (Google Maps)"
        htmlFor="maps_url"
        error={state?.errors?.maps_url}
        hint="Opsional — buka di tab baru saat tamu menekan tombol lokasi."
      >
        <Input
          id="maps_url"
          name="maps_url"
          type="url"
          defaultValue={event?.maps_url ?? ""}
          invalid={!!state?.errors?.maps_url}
          placeholder="https://maps.app.goo.gl/…"
        />
      </Field>

      {isEdit ? (
        <Field
          label="Status"
          htmlFor="status"
          error={state?.errors?.status}
          hint="Status 'Aktif' berarti undangan sudah bisa dilihat tamu."
        >
          <Select
            id="status"
            name="status"
            defaultValue={event?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </Select>
        </Field>
      ) : null}

      <SubmitButton
        pendingText={isEdit ? "Menyimpan…" : "Membuat acara…"}
        className="self-start sm:self-auto"
      >
        {isEdit ? "Simpan perubahan" : "Buat acara"}
      </SubmitButton>
    </form>
  );
}

function isSuccessMessage(message: string): boolean {
  return /^(Perubahan tersimpan|Galeri diperbarui|Tamu dihapus)/.test(message);
}
