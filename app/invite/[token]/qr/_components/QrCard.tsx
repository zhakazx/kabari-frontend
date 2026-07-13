"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { IconCheck, IconQr } from "@/components/ui/icons";

/**
 * Renders the QR code data URL in a centered card with a download link. The
 * download uses the data URL as the anchor `href` so the browser saves the
 * file as `qr-undangan-<token>.png` without any extra server work.
 */
export function QrCard({
  dataUrl,
  token,
}: {
  dataUrl: string;
  token: string;
}) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="rounded-xl border border-border bg-background p-4">
        {/* Native <img> — the source is a data URL, not a network resource. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="QR code undangan"
          width={400}
          height={400}
          className="mx-auto h-64 w-64"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href={dataUrl}
          download={`qr-undangan-${token}.png`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <IconQr size={16} />
          Unduh QR
        </a>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCopy}
        >
          {copied ? <IconCheck size={16} /> : null}
          {copied ? "Tersalin" : "Salin tautan"}
        </Button>
      </div>
    </div>
  );
}
