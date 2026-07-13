import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function DashboardNotFound() {
  return (
    <EmptyState
      title="Halaman tidak ditemukan"
      description="Halaman yang Anda cari tidak tersedia di dasbor."
      action={
        <Button href="/dashboard" size="sm">
          Kembali ke dasbor
        </Button>
      }
    />
  );
}
