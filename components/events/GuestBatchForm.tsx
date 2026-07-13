"use client";

import { useActionState, useState } from "react";

import { createInvitationBatch } from "@/actions/invitations";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck, IconPlus, IconClose } from "@/components/ui/icons";
import type { FormState, Invitation } from "@/lib/types";

type ActionState =
  | (FormState & { invitations?: Invitation[] })
  | undefined;

type Row = {
  id: number;
  name: string;
  phone: string;
  email: string;
  category: "digital" | "fisik";
};

const EMPTY: Omit<Row, "id"> = {
  name: "",
  phone: "",
  email: "",
  category: "digital",
};

let nextId = 1;
function newRow(): Row {
  return { id: nextId++, ...EMPTY };
}

const INITIAL_ROWS: Row[] = [newRow(), newRow()];

/**
 * Inline form for batch-creating invitations. The user can add up to 100
 * rows (the server enforces a 500-tamu cap, but the UI keeps the form
 * responsive). Submitted via the `createInvitationBatch` Server Action;
 * the state carries back the created invitations so we can show a
 * confirmation banner.
 */
export function GuestBatchForm({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [state, formAction] = useActionState<ActionState, FormData>(
    createInvitationBatch,
    undefined,
  );

  function update(id: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function add() {
    setRows((rs) => (rs.length >= 100 ? rs : [...rs, newRow()]));
  }
  function remove(id: number) {
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((r) => r.id !== id)));
  }

  // Compact the rows into the wire format the server action expects.
  // The server takes one `guests[]` FormData entry per row, JSON-encoded
  // so the action can decode with `JSON.parse`.
  const payload = rows.map((r) =>
    JSON.stringify({
      tamu_name: r.name.trim(),
      tamu_phone: r.phone.trim() || undefined,
      tamu_email: r.email.trim() || undefined,
      category: r.category,
    }),
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="event_id" value={eventId} />
      {payload.map((p, i) => (
        <input key={`g-${i}`} type="hidden" name="guests" value={p} />
      ))}

      {state?.message ? (
        <div
          className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm ${
            isSuccessMessage(state.message)
              ? "border-success/25 bg-success-soft text-success"
              : "border-danger/25 bg-danger-soft text-danger"
          }`}
        >
          {isSuccessMessage(state.message) ? (
            <IconCheck size={16} className="mt-0.5 shrink-0" />
          ) : (
            <IconAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                Tamu {idx + 1}
              </span>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground/55 transition hover:bg-surface-muted hover:text-foreground"
                  aria-label={`Hapus baris tamu ${idx + 1}`}
                >
                  <IconClose size={14} />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nama" htmlFor={`name-${row.id}`} required>
                <Input
                  id={`name-${row.id}`}
                  value={row.name}
                  onChange={(e) => update(row.id, { name: e.target.value })}
                  placeholder="Nama tamu"
                  autoComplete="off"
                />
              </Field>
              <Field label="Telepon" htmlFor={`phone-${row.id}`}>
                <Input
                  id={`phone-${row.id}`}
                  value={row.phone}
                  onChange={(e) => update(row.id, { phone: e.target.value })}
                  placeholder="+62…"
                  autoComplete="off"
                />
              </Field>
              <Field label="Email" htmlFor={`email-${row.id}`}>
                <Input
                  id={`email-${row.id}`}
                  type="email"
                  value={row.email}
                  onChange={(e) => update(row.id, { email: e.target.value })}
                  placeholder="nama@email.com"
                  autoComplete="off"
                />
              </Field>
              <Field label="Kategori" htmlFor={`category-${row.id}`}>
                <Select
                  id={`category-${row.id}`}
                  value={row.category}
                  onChange={(e) =>
                    update(row.id, {
                      category: e.target.value as Row["category"],
                    })
                  }
                >
                  <option value="digital">Digital</option>
                  <option value="fisik">Fisik</option>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Pesan / catatan (opsional)"
                  htmlFor={`note-${row.id}`}
                  hint="Tidak dikirim sekarang — tersimpan di data undangan."
                >
                  <Textarea
                    id={`note-${row.id}`}
                    placeholder="Mis. nama panggilan, preferensi vegetarian, dll."
                    rows={2}
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={rows.length >= 100}
        >
          <IconPlus size={14} />
          Tambah baris
        </Button>
        <SubmitButton pendingText="Menambahkan…">
          Tambah {rows.length} tamu
        </SubmitButton>
      </div>
    </form>
  );
}

function isSuccessMessage(message: string): boolean {
  return /^\d+ tamu ditambahkan$/.test(message);
}
