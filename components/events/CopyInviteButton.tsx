"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { IconCheck, IconLink } from "@/components/ui/icons";

/**
 * Small client island used inside the guest table. Copies the public
 * invitation URL to the clipboard and shows a brief "Tersalin" state so
 * the operator knows the click landed.
 */
export function CopyInviteButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function onClick() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => undefined);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition",
        copied
          ? "bg-success-soft text-success"
          : "text-foreground/70 hover:bg-surface-muted hover:text-foreground",
      )}
      aria-label={copied ? "Tersalin" : "Salin tautan undangan"}
    >
      {copied ? <IconCheck size={14} /> : <IconLink size={14} />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}
