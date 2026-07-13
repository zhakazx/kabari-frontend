import { Wordmark } from "@/components/ui/BrandMark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Ceremonial envelope panel — constant ink, day or night. */}
      <aside className="relative hidden overflow-hidden bg-[#16140f] text-[#fbfaf6] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="qr-grid absolute inset-0 text-white/[0.04]"
        />
        <div className="relative">
          <Wordmark
            tone="paper"
            markClassName="h-9 w-9"
            wordmarkClassName="text-[#fbfaf6]"
          />
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
            Platform Undangan Digital
          </p>
          <h1 className="font-display text-[2.6rem] leading-[1.1] font-medium tracking-tight text-[#fbfaf6]">
            Setiap tamu,
            <br />
            satu kabar hangat.
          </h1>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/65">
            Buat undangan, kelola RSVP, dan pindai QR tamu untuk acara Anda —
            semua dalam satu tempat.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-white/45">
          <span className="h-px w-8 bg-white/25" />
          <span>Kabari · Manajemen acara modern</span>
        </div>
      </aside>

      {/* Form column. */}
      <div className="flex flex-col px-5 py-10 sm:px-8 lg:items-center lg:justify-center">
        <div className="mb-8 lg:hidden">
          <Wordmark markClassName="h-9 w-9" />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
