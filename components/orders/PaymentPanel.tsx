"use client";

import { useActionState, useState } from "react";

import { createPayment } from "@/actions/orders";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck } from "@/components/ui/icons";
import {
  PAYMENT_METHOD_LABELS,
  formatRupiah,
} from "@/lib/utils";
import type {
  FormState,
  PaymentCreationResult,
} from "@/lib/types";

type PanelState =
  | (FormState & { payment?: PaymentCreationResult })
  | undefined;

/**
 * Client island for the order-payment side panel. While the user hasn't
 * submitted, it shows a method chooser. After a successful `createPayment`,
 * the resulting `state.payment` is rendered as VA / QRIS instructions.
 */
export function PaymentPanel({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const [state, formAction] = useActionState<PanelState, FormData>(
    createPayment,
    undefined,
  );
  const [dismissed, setDismissed] = useState(false);

  if (state?.payment && !dismissed) {
    return (
      <PaymentResultBlock
        payment={state.payment}
        orderId={orderId}
        onAnother={() => setDismissed(true)}
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="order_id" value={orderId} />

      {state?.message && !state.payment ? (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-foreground/65">Total tagihan</span>
        <span className="font-display text-2xl font-medium tracking-tight">
          {formatRupiah(amount)}
        </span>
      </div>

      <Field label="Metode pembayaran" htmlFor="payment_method" required>
        <Select id="payment_method" name="payment_method" defaultValue="va">
          {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <SubmitButton pendingText="Membuat instruksi…">
        <IconCheck size={16} />
        Buat instruksi bayar
      </SubmitButton>
    </form>
  );
}

function PaymentResultBlock({
  payment,
  orderId,
  onAnother,
}: {
  payment: PaymentCreationResult;
  orderId: string;
  onAnother: () => void;
}) {
  const isVa = payment.virtual_account != null && payment.virtual_account !== "";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
          <IconCheck size={18} />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Instruksi pembayaran dibuat
          </span>
          <span className="text-xs text-foreground/65">
            Invoice {payment.invoice_number}
          </span>
        </div>
      </div>

      {isVa ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
            Virtual Account
          </span>
          <span className="select-all rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-xl font-medium tracking-wider text-foreground">
            {payment.virtual_account}
          </span>
          <span className="text-xs text-foreground/55">
            Salin nomor di atas dan bayar melalui mobile banking.
          </span>
        </div>
      ) : payment.qr_string ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
            QRIS
          </span>
          <code className="block break-all rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground/85">
            {payment.qr_string}
          </code>
          <p className="text-xs text-foreground/55">
            Buka aplikasi e-wallet Anda, pilih bayar dengan QRIS, lalu salin
            payload di atas atau pindai QR yang tersedia di aplikasi.
          </p>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col">
          <dt className="text-foreground/55">Total</dt>
          <dd className="font-medium text-foreground">
            {formatRupiah(payment.amount)}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-foreground/55">Batas bayar</dt>
          <dd className="font-medium text-foreground">
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(payment.expired_at))}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-foreground/55">
        <span>
          Pesanan akan otomatis aktif setelah webhook konfirmasi diterima.
        </span>
        <button
          type="button"
          onClick={onAnother}
          className="font-medium text-accent hover:underline"
        >
          Buat instruksi lain
        </button>
      </div>
      <span className="sr-only">Order {orderId}</span>
    </div>
  );
}
