"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function DashboardError({
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
      title="Dasbor gagal dimuat"
      description="Maaf, terjadi kesalahan saat memuat dasbor. Silakan coba lagi."
      retry={() => unstable_retry()}
    />
  );
}
