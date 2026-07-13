"use client";

import { useActionState } from "react";

import { createOrder } from "@/actions/orders";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck } from "@/components/ui/icons";
import { PACKAGE_PRICE } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";
import type { FormState } from "@/lib/types";

/**
 * Create a new order for an event. The package type and price are
 * server-derived and baked into the `createOrder` action — there is no
 * picker on this form (see `lib/pricing.ts` for the single source of truth).
 */
export function OrderCreateForm({ eventId }: { eventId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createOrder,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="event_id" value={eventId} />

      {state?.message ? (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <Field
        label="Metode pembayaran pilihan"
        htmlFor="preferred_payment_method"
        hint="Anda dapat memilih metode lain saat di halaman pembayaran."
      >
        <Select
          id="preferred_payment_method"
          name="preferred_payment_method"
          defaultValue=""
        >
          <option value="">— Tentukan nanti —</option>
          <option value="va">Virtual Account</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer Bank</option>
        </Select>
      </Field>

      <div className="flex items-center justify-between rounded-md border border-border bg-surface-muted/50 px-4 py-3 text-sm">
        <span className="text-foreground/70">Total tagihan</span>
        <span className="font-display text-lg font-medium tracking-tight text-foreground">
          {formatRupiah(PACKAGE_PRICE)}
        </span>
      </div>

      <SubmitButton pendingText="Membuat pesanan…">
        <IconCheck size={16} />
        Buat pesanan
      </SubmitButton>
    </form>
  );
}
