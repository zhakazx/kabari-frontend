import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      description="Halaman admin yang Anda cari tidak tersedia."
      action={
        <Button href="/admin" size="sm">
          Kembali ke panel admin
        </Button>
      }
    />
  );
}
