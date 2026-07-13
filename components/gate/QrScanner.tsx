"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { checkIn } from "@/actions/check-ins";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  IconAlert,
  IconCamera,
  IconKeyboard,
  IconRefresh,
} from "@/components/ui/icons";
import { CheckInResult } from "@/components/gate/CheckInResult";
import type { CheckInResult as CheckInResultData } from "@/lib/types";

type Phase = "camera" | "submitting" | "result" | "manual";

const DETECT_INTERVAL_MS = 320;
const RESCAN_COOLDOWN_MS = 1500;

/**
 * Client island for the gate scanner. Manages:
 *   - the camera + viewfinder (with the BarcodeDetector API where available),
 *   - the server action (`checkIn`) for both scan and manual paths,
 *   - the result card that replaces the viewfinder for a few seconds,
 *   - sound + haptic feedback for the noisy gate environment,
 *   - the manual entry fallback for guests whose QR won't scan.
 *
 * The plan calls for a `qr-scanner` fallback for browsers without
 * `BarcodeDetector`. Installing that dep needs sign-off, so for now we
 * detect the API and show a clear message + manual entry as fallback.
 */
export function QrScanner({
  operatorName,
  onEventResolved,
}: {
  operatorName: string;
  onEventResolved?: (result: CheckInResultData) => void;
}) {
  const [state, formAction, isPending] = useActionState(checkIn, undefined);
  const [phase, setPhase] = useState<Phase>("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const lastScanRef = useRef<{ token: string; at: number } | null>(null);
  const onEventResolvedRef = useRef(onEventResolved);
  useEffect(() => {
    onEventResolvedRef.current = onEventResolved;
  }, [onEventResolved]);

  // Read `BarcodeDetector` support from the environment via
  // useSyncExternalStore so the server and client agree on the first
  // render — server returns `null`, client returns the real boolean
  // after mount. This avoids a hydration mismatch on the scanner UI.
  const supportsBarcodeDetector = useSyncExternalStore(
    () => () => undefined,
    () => "BarcodeDetector" in window,
    () => null,
  );

  const handleReArm = useCallback(() => {
    setPhase(supportsBarcodeDetector === false ? "manual" : "camera");
  }, [supportsBarcodeDetector]);

  // Haptic + sound feedback for the result. The `state` value carries
  // the action's response; the effect subscribes to it but never calls
  // a setter synchronously.
  useEffect(() => {
    const result = state?.result;
    if (!result) return;
    if (result.event_id) {
      onEventResolvedRef.current?.(result);
    }
    try {
      navigator.vibrate?.(result.check_in_status === "sukses" ? 90 : 220);
    } catch {
      // Some browsers throw on the call (no permission, etc.) — silent.
    }
    playThunk(
      result.check_in_status === "sukses"
        ? "high"
        : result.check_in_status === "gagal"
          ? "low"
          : "alert",
    );
  }, [state]);

  const submitToken = useCallback(
    (token: string) => {
      const trimmed = token.trim();
      if (!trimmed) return;
      const now = Date.now();
      const last = lastScanRef.current;
      if (last && last.token === trimmed && now - last.at < RESCAN_COOLDOWN_MS) {
        return;
      }
      lastScanRef.current = { token: trimmed, at: now };
      setPhase("submitting");
      const fd = new FormData();
      fd.set("qr_code_token", trimmed);
      // The Server Action eventually resolves and `state` updates with
      // either a `result` (success path) or a `message` (error path).
      // We don't await it here — the user gets instant feedback from
      // `isPending` via the viewfinder.
      startTransition(() => {
        formAction(fd);
      });
    },
    [formAction],
  );

  const result = state?.result;
  // If the action returned a result, we're in the "result" phase
  // regardless of `phase`. If the action is pending, we're submitting.
  // Otherwise we're either at the viewfinder or in manual entry.
  const effectivePhase: Phase = result
    ? "result"
    : isPending
      ? "submitting"
      : phase;
  const showResult = effectivePhase === "result";
  const showViewfinder = !showResult;

  // `supportsBarcodeDetector === false` is the only explicit "no"
  // signal. Anything else (null during hydration, or true on the
  // client) is treated as "we can try the camera".
  const detectorNotSupported = supportsBarcodeDetector === false;

  return (
    <div className="flex flex-col gap-5">
      <ScannerViewport
        showViewfinder={showViewfinder}
        result={result}
        operatorName={operatorName}
        cameraError={cameraError}
        onCameraError={setCameraError}
        onDetect={submitToken}
        onReArm={handleReArm}
        supportsBarcodeDetector={supportsBarcodeDetector}
        isPending={isPending}
      />

      {state?.message && !state.result ? (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <ManualEntry
        open={manualOpen || detectorNotSupported}
        onToggle={() => setManualOpen((v) => !v)}
        onSubmit={submitToken}
        error={state?.errors?.qr_code_token}
        disabled={effectivePhase === "submitting"}
      />
    </div>
  );
}

function ScannerViewport({
  showViewfinder,
  result,
  operatorName,
  cameraError,
  onCameraError,
  onDetect,
  onReArm,
  supportsBarcodeDetector,
  isPending,
}: {
  showViewfinder: boolean;
  result: CheckInResultData | undefined;
  operatorName: string;
  cameraError: string | null;
  onCameraError: (msg: string | null) => void;
  onDetect: (token: string) => void;
  onReArm: () => void;
  supportsBarcodeDetector: boolean | null;
  isPending: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!showViewfinder) {
      // Previous effect's cleanup already stopped the camera. Nothing
      // to do here — just exit without scheduling any work. The
      // cleanup runs again before the next setup.
      return;
    }
    if (supportsBarcodeDetector === false) {
      onCameraError(
        "Peramban ini belum mendukung pemindai QR bawaan. Gunakan input manual di bawah.",
      );
      return;
    }
    if (supportsBarcodeDetector === null) {
      // Still syncing with the external store. Don't start the camera
      // yet — the next render will pick up the real value.
      return;
    }

    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        onCameraError(null);
        // Setter called inside an async callback — not in the effect
        // body, so the cascading-render rule is satisfied.
        setActive(true);

        const DetectorCtor = (window as unknown as {
          BarcodeDetector: new (opts?: { formats?: string[] }) => {
            detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
          };
        }).BarcodeDetector;
        const detector = new DetectorCtor({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current);
              const value = codes[0]?.rawValue;
              if (value) {
                onDetect(value);
                return;
              }
            } catch {
              // detection can throw if the frame is empty; ignore.
            }
          }
          window.setTimeout(() => {
            rafRef.current = requestAnimationFrame(tick);
          }, DETECT_INTERVAL_MS);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        onCameraError(
          err instanceof Error
            ? `Tidak dapat mengakses kamera: ${err.message}`
            : "Tidak dapat mengakses kamera.",
        );
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      // Cleanup is a callback returned from the effect — calling
      // setState here is allowed by the cascading-render rule.
      setActive(false);
    };
  }, [showViewfinder, supportsBarcodeDetector, onCameraError, onDetect]);

  const resultKey = result
    ? `${result.tamu_name ?? "?"}-${result.check_in_status}-${result.message ?? ""}`
    : null;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[#0e0d0a] shadow-lift">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      {result && resultKey ? (
        <CheckInResult
          key={resultKey}
          result={result}
          operatorName={operatorName}
          onReArm={onReArm}
        />
      ) : (
        <Viewfinder
          active={active}
          submitting={isPending}
          cameraError={cameraError}
          supportsBarcodeDetector={supportsBarcodeDetector}
        />
      )}
    </div>
  );
}

function Viewfinder({
  active,
  submitting,
  cameraError,
  supportsBarcodeDetector,
}: {
  active: boolean;
  submitting: boolean;
  cameraError: string | null;
  supportsBarcodeDetector: boolean | null;
}) {
  if (submitting) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0e0d0a]/85 text-[#fbfaf6]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={28} className="text-white" />
          <p className="text-sm font-medium">Memverifikasi…</p>
        </div>
      </div>
    );
  }

  // `false` is the only "we definitely don't have BarcodeDetector"
  // signal. `null` is the SSR placeholder, which we treat like
  // "still figuring it out" — render the same neutral view as a
  // supported browser to keep the first paint identical.
  if (supportsBarcodeDetector === false) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0e0d0a]/92 p-6 text-center text-[#fbfaf6]">
        <div className="flex max-w-sm flex-col items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <IconCamera size={22} />
          </span>
          <p className="font-display text-lg font-medium">
            Pemindai kamera tidak tersedia
          </p>
          <p className="text-sm text-white/65">
            Peramban Anda tidak mendukung <code className="font-mono text-white/85">BarcodeDetector</code>.
            Gunakan input manual di bawah untuk check-in.
          </p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0e0d0a]/92 p-6 text-center text-[#fbfaf6]">
        <div className="flex max-w-sm flex-col items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <IconCamera size={22} />
          </span>
          <p className="text-sm text-white/75">{cameraError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#16140f]/35"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Reticle active={active} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-xs text-white/80">
        <span>Arahkan kamera ke QR tamu</span>
        {active ? (
          <span className="font-mono">scanning…</span>
        ) : (
          <span className="font-mono">menyiapkan kamera…</span>
        )}
      </div>
    </>
  );
}

function Reticle({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "relative aspect-square w-3/4 max-w-[360px] transition-transform",
        active ? "scale-100" : "scale-95",
      )}
    >
      <Bracket className="absolute left-0 top-0 -translate-x-1 -translate-y-1" rotate={0} />
      <Bracket className="absolute right-0 top-0 translate-x-1 -translate-y-1" rotate={90} />
      <Bracket className="absolute bottom-0 left-0 -translate-x-1 translate-y-1" rotate={270} />
      <Bracket className="absolute bottom-0 right-0 translate-x-1 translate-y-1" rotate={180} />
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-2 top-1/2 h-px -translate-y-1/2 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="scan-line h-full w-full" />
      </div>
    </div>
  );
}

function Bracket({ className, rotate }: { className?: string; rotate: number }) {
  return (
    <span
      aria-hidden
      className={cn("block h-7 w-7", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="#fbfaf6" strokeWidth={2.4} strokeLinecap="round">
        <path d="M2 8V4a2 2 0 0 1 2-2h4" />
      </svg>
    </span>
  );
}

function ManualEntry({
  open,
  onToggle,
  onSubmit,
  error,
  disabled,
}: {
  open: boolean;
  onToggle: () => void;
  onSubmit: (token: string) => void;
  error: string | string[] | undefined;
  disabled: boolean;
}) {
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const token = String(fd.get("qr_code_token") ?? "");
    if (token.trim().length === 0) return;
    onSubmit(token);
    formRef.current?.reset();
  };

  return (
    <section className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconKeyboard size={16} className="text-foreground/55" />
          Input manual token
        </span>
        <span className="text-xs text-foreground/55">
          {open ? "Sembunyikan" : "Tampilkan"}
        </span>
      </button>
      {open ? (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-border p-4"
        >
          <Field
            label="Token QR"
            htmlFor={inputId}
            hint="Salin dari tautan undangan atau tempel dari aplikasi pemindai."
            error={error}
          >
            <Input
              id={inputId}
              name="qr_code_token"
              placeholder="contoh: a3f9…"
              autoComplete="off"
              spellCheck={false}
              invalid={!!error}
              disabled={disabled}
            />
          </Field>
          <div className="flex items-center gap-2">
            <SubmitButton
              pendingText="Mengirim…"
              size="sm"
              className="w-auto self-start"
            >
              <IconRefresh size={14} />
              Check-in manual
            </SubmitButton>
            <span className="text-xs text-foreground/55">
              Hasil muncul di viewfinder.
            </span>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function playThunk(kind: "high" | "low" | "alert") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = kind === "high" ? 540 : kind === "low" ? 220 : 160;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (kind === "alert") {
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
    }
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Audio API unavailable (autoplay policy, etc.) — silent fallback.
  }
}
