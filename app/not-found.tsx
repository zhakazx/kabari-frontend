import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <BrandMark className="h-12 w-12" />
      <p className="font-display text-6xl font-medium tracking-tight text-foreground">
        404
      </p>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl font-medium text-foreground">
          Halaman tidak ditemukan
        </h2>
        <p className="max-w-sm text-sm text-foreground/60">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <Button href="/">Kembali ke beranda</Button>
    </div>
  );
}
