"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { IconCheck, IconAlert, IconInfo, IconClose } from "@/components/ui/icons";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function emit() {
  listeners.forEach((l) => l());
}

function add(kind: ToastKind, message: string) {
  const id = ++counter;
  toasts = [...toasts, { id, kind, message }];
  emit();
  setTimeout(() => dismiss(id), 4200);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (message: string) => add("success", message),
  error: (message: string) => add("error", message),
  info: (message: string) => add("info", message),
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot(): Toast[] {
  return toasts;
}

const ICONS = {
  success: { icon: IconCheck, class: "bg-success-soft text-success" },
  error: { icon: IconAlert, class: "bg-danger-soft text-danger" },
  info: { icon: IconInfo, class: "bg-info-soft text-info" },
} as const;

export function Toaster() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      aria-live="polite"
      aria-atomic="true"
      suppressHydrationWarning
    >
      {list.map((t) => {
        const { icon: Icon, class: tone } = ICONS[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lift"
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                tone,
              )}
            >
              <Icon size={15} />
            </span>
            <p className="flex-1 text-sm leading-5 text-foreground">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Tutup"
              className="-mr-1 inline-flex h-6 w-6 items-center justify-center rounded text-foreground/50 transition hover:bg-surface-muted hover:text-foreground"
            >
              <IconClose size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
