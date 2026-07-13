"use client";

import { useState } from "react";

import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlertOctagon, IconTrash } from "@/components/ui/icons";

/**
 * Delete a user with a confirm step. The button is intentionally disabled
 * for the admin's own account — the server also rejects the request as
 * defense in depth, but the UI should never show an action that can't be
 * taken.
 */
export function DeleteUserButton({
  userId,
  userName,
  isSelf,
}: {
  userId: string;
  userName: string;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (isSelf) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-foreground/40"
        disabled
        title="Anda tidak dapat menghapus akun sendiri"
      >
        <IconTrash size={14} />
        Hapus
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-danger hover:bg-danger-soft hover:text-danger"
        onClick={() => setOpen(true)}
      >
        <IconTrash size={14} />
        Hapus
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hapus pengguna?"
        description={`Pengguna "${userName}" akan dihapus permanen dari platform. Tindakan ini tidak dapat dibatalkan.`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <form action={deleteUser}>
              <input type="hidden" name="user_id" value={userId} />
              <SubmitButton
                variant="danger"
                size="sm"
                pendingText="Menghapus…"
                className="w-full"
              >
                <IconTrash size={14} />
                Hapus permanen
              </SubmitButton>
            </form>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlertOctagon
            size={18}
            className="mt-0.5 shrink-0"
          />
          <p>
            Semua data terkait — pesanan, template, dan undangannya — akan
            ikut terhapus.
          </p>
        </div>
      </Modal>
    </>
  );
}
