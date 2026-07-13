import Link from "next/link";

import { BrandMark, Wordmark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* HERO — editorial, asymmetric, with an invitation mockup as product evidence. */}
      <section className="relative isolate px-6 pb-16 pt-16 sm:pt-24 lg:pt-32">
        <div
          aria-hidden
          className="qr-grid absolute inset-0 text-foreground/[0.03]"
        />

        <div className="relative mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_380px] lg:gap-16 xl:gap-24">
          {/* Left — the message. */}
          <div className="flex flex-col gap-6 lg:pt-10">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.28em] text-[#A68A56] ${styles.fadeUp1}`}
            >
              Platform Undangan Digital
            </p>

            <h1
              className={`font-display text-5xl font-medium leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl ${styles.fadeUp2}`}
            >
              Setiap tamu,
              <br />
              satu kabar hangat.
            </h1>

            <p
              className={`max-w-lg text-base leading-relaxed text-foreground/60 sm:text-[1.05rem] ${styles.fadeUp2}`}
            >
              Buat undangan digital, kelola RSVP, dan pindai QR tamu di gerbang
              — semuanya dalam satu platform yang tenang.
            </p>

            <div
              className={`mt-2 flex flex-wrap gap-3 ${styles.fadeUp3}`}
            >
              <Button href="/templates" size="lg">
                Mulai buat acara
                <IconArrowRight size={18} />
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Sudah punya akun? Masuk
              </Button>
            </div>
          </div>

          {/* Right — invitation mockup. */}
          <div className="flex justify-center lg:justify-end lg:pt-2">
            <div
              className={`relative aspect-[3/4] w-full max-w-[270px] overflow-hidden rounded-xl border border-border bg-surface shadow-lift ${styles.cardIn} rotate-2`}
            >
              <div
                aria-hidden
                className="qr-grid absolute inset-0 text-foreground/[0.025]"
              />

              {/* Top decorative rule */}
              <div
                aria-hidden
                className="absolute left-6 right-6 top-6 h-px bg-[#A68A56]/25"
              />

              {/* Content */}
              <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
                {/* Seal */}
                <BrandMark className="mb-5 h-9 w-9" />

                {/* Invitation text */}
                <p className="text-[10px] leading-relaxed tracking-[0.04em] text-foreground/45">
                  Dengan penuh rasa syukur,
                  <br />
                  kami mengundang
                  <br />
                  Bapak/Ibu/Sdr/i
                </p>

                {/* Divider */}
                <div
                  aria-hidden
                  className="my-3 h-px w-8 bg-[#A68A56]/15"
                />

                {/* Date block */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-display text-2xl font-medium">
                      24
                    </span>
                    <span className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-foreground/30">
                      Agu
                    </span>
                  </div>
                  <span className="-mt-3 font-display text-lg text-foreground/12">
                    ·
                  </span>
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-display text-2xl font-medium">
                      27
                    </span>
                    <span className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-foreground/30">
                      2027
                    </span>
                  </div>
                </div>

                {/* Time & venue */}
                <p className="mt-2 text-[9px] leading-relaxed text-foreground/40">
                  Sabtu, 09.00 WIB
                </p>
                <p className="mt-0.5 text-[9px] leading-relaxed text-foreground/40">
                  Gedung Serbaguna
                  <br />
                  Jakarta Selatan
                </p>

                {/* Bottom QR label */}
                <div className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-md border border-[#A68A56]/20 bg-[#A68A56]/[0.06] px-2 py-1">
                  <div
                    aria-hidden
                    className="qr-grid h-3.5 w-3.5 text-[#A68A56]/35 [background-size:7px_7px]"
                  />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#A68A56]">
                    Konfirmasi
                  </span>
                </div>

                {/* Bottom decorative rule */}
                <div
                  aria-hidden
                  className="absolute bottom-6 left-6 right-6 h-px bg-[#A68A56]/25"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP — social proof without dashboard aesthetics. */}
      <section className="border-b border-border px-6 py-14 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12 md:gap-20">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              50+
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/40">
              Template
            </span>
          </div>
          <span aria-hidden className="hidden h-10 w-px bg-border sm:block" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              10rb+
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/40">
              Undangan Terkirim
            </span>
          </div>
          <span aria-hidden className="hidden h-10 w-px bg-border sm:block" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              &lt; 5
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/40">
              Menit Setup
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — steps with visual illustrations. */}
      <section
        aria-labelledby="how-it-works"
        className="bg-surface/60 px-6 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68A56]">
              Alur singkat
            </p>
            <h2
              id="how-it-works"
              className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
            >
              Tiga langkah, satu kabar.
            </h2>
          </div>

          <ol className="flex flex-col gap-14 sm:gap-20">
            {/* Step 1 — Pilih template */}
            <li className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:gap-10">
              {/* Visual: template card spread */}
              <div
                aria-hidden
                className="relative h-28 w-full max-w-[160px] sm:h-32"
              >
                <div className="absolute bottom-0 left-0 h-24 w-20 rounded-lg border border-border bg-surface shadow-card" />
                <div className="absolute bottom-1 left-3 h-24 w-20 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
                  <div className="qr-grid h-full w-full text-foreground/[0.05] rounded-lg" />
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 rounded-b-lg bg-gradient-to-t from-[#A68A56]/8 to-transparent" />
                </div>
                <div className="absolute bottom-2 left-6 h-24 w-20 rounded-lg border border-border bg-surface shadow-card">
                  <div className="flex h-full flex-col justify-between p-2.5">
                    <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
                    <div className="h-1 w-8 rounded-full bg-foreground/10" />
                    <div className="h-1 w-10 rounded-full bg-foreground/10" />
                  </div>
                </div>
              </div>

              <div className="flex gap-5 sm:gap-8">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A68A56]/10 text-sm font-semibold leading-none text-[#A68A56] ring-1 ring-inset ring-[#A68A56]/25 sm:h-10 sm:w-10 sm:text-base"
                >
                  1
                </span>
                <div className="flex flex-col gap-1.5 pt-[3px] sm:pt-1">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    Pilih template
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/60">
                    Telusuri katalog template undangan yang dirancang kreator
                    lokal — dari pernikahan sampai acara korporat.
                  </p>
                  <Link
                    href="/templates"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-foreground/40 transition-colors hover:text-[#A68A56]"
                  >
                    Lihat template
                    <IconArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </li>

            {/* Step 2 — Atur acara & tamu */}
            <li className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:gap-10">
              {/* Visual: guest list snippet */}
              <div
                aria-hidden
                className="w-full max-w-[180px] overflow-hidden rounded-lg border border-border bg-surface shadow-card"
              >
                <div className="border-b border-border bg-surface-muted/40 px-3 py-1.5">
                  <span className="text-[10px] font-medium text-foreground/50">
                    Daftar Tamu
                  </span>
                </div>
                <div className="flex flex-col gap-2 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/15" />
                    <div className="h-1 w-20 rounded-full bg-foreground/10" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/15" />
                    <div className="h-1 w-24 rounded-full bg-foreground/10" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A68A56]/70" />
                    <div className="h-1 w-16 rounded-full bg-foreground/15" />
                    <span className="text-[8px] font-medium text-[#A68A56]">
                      Anda
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/15" />
                    <div className="h-1 w-14 rounded-full bg-foreground/10" />
                  </div>
                </div>
              </div>

              <div className="flex gap-5 sm:gap-8">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A68A56]/10 text-sm font-semibold leading-none text-[#A68A56] ring-1 ring-inset ring-[#A68A56]/25 sm:h-10 sm:w-10 sm:text-base"
                >
                  2
                </span>
                <div className="flex flex-col gap-1.5 pt-[3px] sm:pt-1">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    Atur acara &amp; tamu
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/60">
                    Buat detail acara, impor daftar tamu, dan kirim undangan
                    sekaligus — semua dari satu dashboard.
                  </p>
                  <Link
                    href="/login"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-foreground/40 transition-colors hover:text-[#A68A56]"
                  >
                    Masuk untuk mulai
                    <IconArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </li>

            {/* Step 3 — RSVP & check-in */}
            <li className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:gap-10">
              {/* Visual: QR scanner frame */}
              <div
                aria-hidden
                className="relative flex h-40 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-[#16140f] shadow-card"
              >
                <div className="qr-grid absolute inset-0 text-white/[0.12] [background-size:9px_9px]" />
                <div
                  className="absolute left-1.5 right-1.5 h-px bg-[#A68A56]/60 shadow-[0_0_6px_#A68A56]"
                  style={{
                    animation:
                      "scan-sweep 1.8s ease-in-out infinite",
                  }}
                />
                <span className="absolute top-2 left-2 block h-3 w-3 border-l border-t border-[#A68A56]/40" />
                <span className="absolute top-2 right-2 block h-3 w-3 border-r border-t border-[#A68A56]/40" />
                <span className="absolute bottom-2 left-2 block h-3 w-3 border-l border-b border-[#A68A56]/40" />
                <span className="absolute bottom-2 right-2 block h-3 w-3 border-r border-b border-[#A68A56]/40" />
              </div>

              <div className="flex gap-5 sm:gap-8">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A68A56]/10 text-sm font-semibold leading-none text-[#A68A56] ring-1 ring-inset ring-[#A68A56]/25 sm:h-10 sm:w-10 sm:text-base"
                >
                  3
                </span>
                <div className="flex flex-col gap-1.5 pt-[3px] sm:pt-1">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    Kumpulkan RSVP &amp; check-in
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/60">
                    Tamu konfirmasi kehadiran lewat QR, dan gerbang memindai
                    mereka saat tiba — real-time di dashboard Anda.
                  </p>
                  <Link
                    href="/login"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-foreground/40 transition-colors hover:text-[#A68A56]"
                  >
                    Pelajari alur
                    <IconArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA STRIP — focused, restrained. */}
      <section className="relative isolate overflow-hidden bg-[#16140f] px-6 py-20 text-[#fbfaf6] sm:py-28">
        <div
          aria-hidden
          className="qr-grid absolute inset-0 text-white/[0.04]"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span aria-hidden className="h-px w-16 bg-[#A68A56]/50" />
          <h2 className="max-w-2xl font-display text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl">
            Tamu Anda sudah menunggu kabar.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/55">
            Buat acara pertama Anda hari ini — tidak butuh kartu, tidak butuh
            desain.
          </p>
          <Button
            href="/templates"
            variant="secondary"
            size="lg"
            className="mt-2"
          >
            Jelajahi template
            <IconArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* FOOTER — unchanged. */}
      <footer className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <Wordmark
          markClassName="h-6 w-6"
          wordmarkClassName="text-sm tracking-[0.22em]"
        />
        <p className="text-xs text-foreground/50">
          © KABARI · Undangan digital &amp; manajemen acara
        </p>
        <p className="text-xs text-foreground/40">
          <Link href="/login" className="hover:text-foreground/70">
            Masuk
          </Link>
          {" · "}
          <Link href="/register" className="hover:text-foreground/70">
            Daftar
          </Link>
        </p>
      </footer>
    </main>
  );
}
