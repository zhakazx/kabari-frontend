"use client";

import { useActionState } from "react";

import { updateEvent } from "@/actions/events";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { EventStatus, FormState } from "@/lib/types";

/**
 * Compact status switcher that lives in the event detail toolbar. The
 * `<form>` action is the same `updateEvent` Server Action used by the full
 * edit form — it accepts partial DTO and writes whatever fields arrive.
 */
export function EventStatusForm({
  eventId,
  status,
}: {
  eventId: string;
  status: EventStatus;
}) {
  const [, formAction] = useActionState<FormState, FormData>(updateEvent, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="event_id" value={eventId} />
      <Select
        name="status"
        defaultValue={status}
        aria-label="Ubah status acara"
        className="h-9 min-w-32 text-xs"
      >
        <option value="draft">Draft</option>
        <option value="active">Aktif</option>
        <option value="completed">Selesai</option>
        <option value="cancelled">Dibatalkan</option>
      </Select>
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="Menyimpan…"
      >
        Simpan status
      </SubmitButton>
    </form>
  );
}
