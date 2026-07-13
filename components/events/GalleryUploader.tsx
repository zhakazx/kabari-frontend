"use client";

import { startTransition, useActionState, useRef, useState } from "react";

import { uploadGallery } from "@/actions/events";
import { Button } from "@/components/ui/Button";
import { IconAlert, IconCheck, IconImage, IconClose } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/types";

const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;

type Preview = { name: string; size: number; url: string };

/**
 * Uploads new gallery images for an event. We build a `FormData` payload
 * client-side (so the Server Action can read each file under `gallery`)
 * and dispatch it via `formAction`. The native `<input type="file">` is
 * uncontrolled — its `files` list is read at pick-time only.
 */
export function GalleryUploader({ eventId }: { eventId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction] = useActionState<FormState, FormData>(
    uploadGallery,
    undefined,
  );

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const picked = Array.from(e.target.files ?? []);
    const next: File[] = [...files];
    const nextPreviews: Preview[] = [...previews];

    for (const f of picked) {
      if (next.length >= MAX_FILES) {
        setClientError(`Maksimal ${MAX_FILES} gambar sekaligus`);
        break;
      }
      if (f.size > MAX_BYTES) {
        setClientError(`"${f.name}" melebihi 10MB`);
        continue;
      }
      if (!f.type.startsWith("image/")) {
        setClientError(`"${f.name}" bukan gambar`);
        continue;
      }
      next.push(f);
      nextPreviews.push({
        name: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
      });
    }
    setFiles(next);
    setPreviews(nextPreviews);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    setFiles((arr) => arr.filter((_, i) => i !== index));
    setPreviews((arr) => {
      const removed = arr[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return arr.filter((_, i) => i !== index);
    });
  }

  function clear() {
    setFiles([]);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) return;
    const payload = new FormData();
    payload.set("event_id", eventId);
    for (const f of files) payload.append("gallery", f);
    startTransition(() => {
      formAction(payload);
    });
  }

  const isSuccess = state?.message ? /^Galeri/.test(state.message) : false;
  const message = clientError ?? state?.message;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {message ? (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm",
            isSuccess
              ? "border-success/25 bg-success-soft text-success"
              : "border-danger/25 bg-danger-soft text-danger",
          )}
        >
          {isSuccess ? (
            <IconCheck size={16} className="mt-0.5 shrink-0" />
          ) : (
            <IconAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <p>{message}</p>
        </div>
      ) : null}

      <label
        htmlFor="gallery-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 py-10 text-center text-sm text-foreground/65 transition hover:bg-surface-muted"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground/55">
          <IconImage size={20} />
        </span>
        <span className="font-medium text-foreground">Pilih gambar</span>
        <span className="text-xs">
          Maksimal {MAX_FILES} gambar · 10MB per file
        </span>
        <input
          id="gallery-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {previews.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {previews.map((p, i) => (
            <li
              key={p.url}
              className="group relative overflow-hidden rounded-lg border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.name}
                className="block aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-foreground/65 to-transparent px-2 py-1.5 text-xs text-white">
                <span className="truncate">{p.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Hapus ${p.name}`}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-foreground/70 opacity-0 transition group-hover:opacity-100"
              >
                <IconClose size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {files.length > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Bersihkan
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={files.length === 0}
          size="sm"
        >
          Unggah {files.length > 0 ? `${files.length} gambar` : "gambar"}
        </Button>
      </div>
    </form>
  );
}
