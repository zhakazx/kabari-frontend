"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Dynamic wrapper for the QR scanner. The QrScanner relies on browser-only
 * APIs (`BarcodeDetector`, `MediaDevices.getUserMedia`, `useActionState` in
 * a form) and is large (~550 lines). Importing it through `next/dynamic`
 * with `ssr: false` keeps it out of the gate layout's server bundle and
 * the initial client bundle, so the route loads quickly and only spins up
 * the camera pipeline after the user reaches the gate view.
 */
export const QrScannerClient = dynamic(
  () => import("./QrScanner").then((m) => m.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <div className="aspect-[4/3] w-full">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    ),
  },
);
