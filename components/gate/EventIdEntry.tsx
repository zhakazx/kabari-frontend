"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { IconSearch } from "@/components/ui/icons";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The gate operator pastes an event UUID and we navigate to
 * `/gate/history?eventId=<id>`. The page re-fetches the check-in list
 * based on the new param. We keep the current id in a controlled input
 * so the operator can correct a typo before re-submitting.
 */
export function EventIdEntry({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setError("ID acara wajib diisi");
      return;
    }
    if (!UUID_RE.test(trimmed)) {
      setError("Format ID acara tidak valid (UUID)");
      return;
    }
    setError(null);
    router.push(`/gate/history?eventId=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end sm:gap-3"
    >
      <Field
        label="ID acara"
        htmlFor="eventId"
        hint="Salin dari URL atau panel penyelenggara (format UUID)."
        error={error ?? undefined}
        className="flex-1"
      >
        <Input
          id="eventId"
          name="eventId"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="00000000-0000-0000-0000-000000000000"
          autoComplete="off"
          spellCheck={false}
          invalid={!!error}
          className={cn("font-mono")}
        />
      </Field>
      <SubmitButton
        size="md"
        pendingText="Memuat…"
        className="w-auto sm:w-44"
      >
        <IconSearch size={15} />
        Tampilkan riwayat
      </SubmitButton>
    </form>
  );
}
