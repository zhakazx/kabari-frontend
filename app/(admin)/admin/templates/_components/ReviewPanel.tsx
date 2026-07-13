"use client";

import { useActionState, useState } from "react";

import { validateTemplate } from "@/actions/templates";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck, IconClose, IconUserCheck } from "@/components/ui/icons";
import { cn, TEMPLATE_STATUS_LABELS, statusBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Template } from "@/lib/types";

/**
 * Admin review panel. Two flows share one form:
 *  - Approve: optional notes, sets `status: 'published'`.
 *  - Reject: required notes, sets `status: 'rejected'`.
 *
 * The action returns `intent` so we can show a per-flow confirmation
 * banner. Approve submits immediately; Reject first opens a confirm
 * modal so the admin can read back the note they typed.
 */
export function ReviewPanel({ template }: { template: Template }) {
  const [state, formAction] = useActionState(validateTemplate, undefined);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [pendingNotes, setPendingNotes] = useState("");

  const isPending = template.status === "pending_review";
  const lastIntent = state?.intent;
  const newStatus = state?.status ?? template.status;

  const showSuccess = Boolean(
    lastIntent && state?.message && /dipublikasikan|ditolak/.test(state.message),
  );
  const showError = Boolean(state?.message && !showSuccess);

  return (
    <div className="flex flex-col gap-5">
      {showSuccess ? (
        <div className="flex items-start gap-2.5 rounded-md border border-success/25 bg-success-soft px-3 py-2.5 text-sm text-success">
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          <p>{state!.message}</p>
        </div>
      ) : null}
      {showError ? (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state!.message}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadgeVariant(newStatus)} dot>
          {TEMPLATE_STATUS_LABELS[newStatus]}
        </Badge>
        {isPending ? (
          <span className="text-xs text-foreground/55">
            · Template ini menunggu tinjauan Anda.
          </span>
        ) : null}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="template_id" value={template.id} />
        <input type="hidden" name="status" value="published" />
        <Field
          label="Catatan untuk kreator"
          htmlFor="notes"
          error={state?.errors?.notes}
          hint={
            isPending
              ? "Wajib diisi saat menolak. Opsional saat menyetujui."
              : "Tambahkan catatan jika Anda ingin mengubah status template ini."
          }
        >
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            defaultValue={template.admin_notes ?? ""}
            invalid={!!state?.errors?.notes}
            placeholder={
              isPending
                ? "Contoh: palet warna sudah bagus, tapi mohon periksa kontras pada teks utama."
                : "Catatan untuk kreator (opsional)"
            }
          />
        </Field>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              setPendingNotes(
                (
                  document.getElementById("notes") as HTMLTextAreaElement | null
                )?.value ?? "",
              );
              setRejectOpen(true);
            }}
            disabled={!isPending && newStatus === "rejected"}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-60",
              "border border-danger/30 bg-danger-soft text-danger hover:bg-danger hover:text-white",
            )}
          >
            <IconClose size={16} />
            Tolak
          </button>
          <SubmitButton
            pendingText="Menyetujui…"
            className="w-auto"
          >
            <IconUserCheck size={16} />
            {newStatus === "published" ? "Sudah disetujui" : "Setujui"}
          </SubmitButton>
        </div>
      </form>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Tolak template?"
        description="Template akan ditandai 'Ditolak' dan kreator akan melihat catatan Anda. Tindakan ini dapat dibalik dari halaman ini."
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground/80 transition hover:bg-surface-muted"
            >
              Batal
            </button>
            <form
              action={formAction}
              onSubmit={() => {
                setRejectOpen(false);
              }}
              className="contents"
            >
              <input type="hidden" name="template_id" value={template.id} />
              <input type="hidden" name="status" value="rejected" />
              <input type="hidden" name="notes" value={pendingNotes} />
              <SubmitButton
                variant="danger"
                size="sm"
                pendingText="Menolak…"
                className="w-full"
              >
                <IconClose size={14} />
                Tolak permanen
              </SubmitButton>
            </form>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border bg-surface-muted/40 p-3 text-sm text-foreground/85">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Catatan yang akan dikirim
            </span>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">
              {pendingNotes.trim() || (
                <span className="italic text-danger">
                  Catatan kosong — penolakan tanpa catatan tidak diizinkan.
                </span>
              )}
            </p>
          </div>
          {pendingNotes.trim().length === 0 ? (
            <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
              <IconAlert size={16} className="mt-0.5 shrink-0" />
              <p>
                Tulis catatan pada kolom di luar modal terlebih dahulu,
                kemudian buka kembali dialog ini.
              </p>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
