"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Panel admin gagal dimuat"
      description="Maaf, terjadi kesalahan saat memuat panel admin. Silakan coba lagi."
      retry={() => unstable_retry()}
    />
  );
}
