"use client";

import { useActionState, useState } from "react";

import { submitRsvp } from "@/actions/rsvp";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconAlert, IconCheck, IconUsers } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { RsvpStatus } from "@/lib/types";

const CHOICES: {
  value: Extract<RsvpStatus, "hadir" | "tidak_hadir">;
  title: string;
  description: string;
  tone: "positive" | "negative";
}[] = [
  {
    value: "hadir",
    title: "Saya akan hadir",
    description: "Sampai jumpa di hari istimewa.",
    tone: "positive",
  },
  {
    value: "tidak_hadir",
    title: "Maaf, saya tidak bisa hadir",
    description: "Terima kasih atas undangannya.",
    tone: "negative",
  },
];

export function RsvpForm({
  token,
  guestName,
  initialStatus,
  initialCount,
}: {
  token: string;
  guestName: string;
  initialStatus: RsvpStatus;
  initialCount: number;
}) {
  const initialChoice: "hadir" | "tidak_hadir" | "" =
    initialStatus === "hadir" || initialStatus === "tidak_hadir"
      ? initialStatus
      : "";
  const [status, setStatus] = useState<"hadir" | "tidak_hadir" | "">(
    initialChoice,
  );
  const [state, action] = useActionState(submitRsvp, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      {state?.message ? (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/50 p-4 text-sm text-foreground/70">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
          Atas nama
        </span>
        <span className="font-display text-base font-medium text-foreground">
          {guestName}
        </span>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Apakah Anda akan hadir?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CHOICES.map((c) => {
            const selected = status === c.value;
            return (
              <label
                key={c.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border bg-surface p-4 transition",
                  selected
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rsvp_status"
                    value={c.value}
                    checked={selected}
                    onChange={() => setStatus(c.value)}
                    className="sr-only"
                    required
                  />
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                      selected ? "border-accent bg-accent" : "border-foreground/30",
                    )}
                    aria-hidden
                  >
                    {selected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />
                    ) : null}
                  </span>
                  <span className="font-medium text-foreground">{c.title}</span>
                </span>
                <span className="text-xs text-foreground/60">
                  {c.description}
                </span>
              </label>
            );
          })}
        </div>
        {state?.errors?.rsvp_status ? (
          <p className="text-xs font-medium text-danger">
            {state.errors.rsvp_status.join(", ")}
          </p>
        ) : null}
      </fieldset>

      {status === "hadir" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
          <Field
            label="Jumlah hadir"
            htmlFor="jumlah_hadir"
            required
            error={state?.errors?.jumlah_hadir}
            hint="Maksimal 20 orang."
          >
            <div className="relative">
              <IconUsers
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
                aria-hidden
              />
              <Input
                id="jumlah_hadir"
                name="jumlah_hadir"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                defaultValue={initialCount}
                className="h-10 pl-9 pr-3"
              />
            </div>
          </Field>

          <Field
            label="Pesan untuk penyelenggara"
            htmlFor="message"
            hint="Opsional."
            error={state?.errors?.message}
          >
            <Textarea
              id="message"
              name="message"
              maxLength={500}
              placeholder="Doa, ucapan, atau pesan singkat…"
            />
          </Field>
        </div>
      ) : null}

      <SubmitButton
        pendingText="Mengirim…"
        size="lg"
        className="w-full sm:w-auto sm:self-start"
      >
        <IconCheck size={16} />
        Kirim konfirmasi
      </SubmitButton>

      <p className="text-xs text-foreground/50">
        Dengan mengirim, Anda menyetujui bahwa penyelenggara akan menerima
        pembaruan status kehadiran Anda.
      </p>
    </form>
  );
}
