"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "@/components/ui/Toaster";

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Buka modal
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Contoh Modal"
        description="Modal menggunakan elemen <dialog> native — tutup dengan Esc atau klik latar."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Konfirmasi
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground/70">
          Ini adalah isi modal. Primitif ini siap dipakai untuk konfirmasi
          check-in, validasi template, dan aksi lain di fase berikutnya.
        </p>
      </Modal>
    </>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.success("Tamu berhasil check-in.")}
      >
        Toast sukses
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.error("QR tidak terdaftar.")}
      >
        Toast error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.info("Undangan terkirim ke 12 tamu.")}
      >
        Toast info
      </Button>
    </div>
  );
}

export function ErrorStateDemo() {
  const [nonce, setNonce] = useState(0);
  return (
    <ErrorState
      key={nonce}
      title="Gagal memuat"
      description="Contoh keadaan error dengan tombol coba lagi."
      retry={() => setNonce((n) => n + 1)}
    />
  );
}
