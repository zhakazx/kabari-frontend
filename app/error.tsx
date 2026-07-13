"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ErrorPage({
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
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-10">
      <ErrorState
        title="Terjadi kesalahan"
        description="Maaf, sesuatu yang tidak terduga terjadi. Silakan coba lagi."
        retry={() => unstable_retry()}
        className="w-full max-w-lg"
      />
    </div>
  );
}
