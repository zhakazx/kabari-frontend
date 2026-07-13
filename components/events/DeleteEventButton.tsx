"use client";

import { useState, useTransition } from "react";

import { deleteEvent } from "@/actions/events";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IconAlert } from "@/components/ui/icons";

/**
 * A delete control that opens a confirmation modal. The form posts the event
 * id to `deleteEvent` and then redirects to `/events`. The submit lives in
 * the modal footer so the user can cancel easily.
 */
export function DeleteEventButton({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-danger hover:bg-danger-soft"
      >
        Hapus acara
      </Button>
      <Modal
        open={open}
        onClose={() => (pending ? undefined : setOpen(false))}
        title="Hapus acara?"
        description="Tindakan ini tidak dapat dibatalkan. Tamu, undangan, dan pesanan terkait juga akan ikut terhapus."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <form
              action={(fd) => {
                startTransition(async () => {
                  setOpen(false);
                  await deleteEvent(fd);
                });
              }}
            >
              <input type="hidden" name="event_id" value={eventId} />
              <Button
                type="submit"
                variant="danger"
                size="sm"
                pending={pending}
              >
                Hapus acara
              </Button>
            </form>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>
            Anda akan menghapus <span className="font-medium">{eventName}</span>{" "}
            secara permanen.
          </p>
        </div>
      </Modal>
    </>
  );
}
