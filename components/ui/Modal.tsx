"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialog.open) onClose();
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-full rounded-xl border border-border bg-surface p-0 text-foreground shadow-lift",
        SIZES[size],
        className,
      )}
    >
      {(title || description) && (
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="font-display text-lg font-medium tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-foreground/60">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition hover:bg-surface-muted hover:text-foreground"
          >
            <IconClose size={18} />
          </button>
        </div>
      )}
      {children && <div className="px-6 pb-4">{children}</div>}
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-border p-6 pt-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
