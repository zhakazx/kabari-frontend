"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          background: "#16140f",
          color: "#fbfaf6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          textAlign: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="48" height="48" aria-label="KABARI">
          <rect x="1.25" y="1.25" width="21.5" height="21.5" rx="6" fill="#fbfaf6" />
          <g stroke="#16140f" strokeWidth="2.3" strokeLinecap="round" fill="none">
            <path d="M8.4 5.6 V18.4" />
            <path d="M8.9 12 L16.6 5.6" />
            <path d="M8.9 12 L16.6 18.4" />
          </g>
          <rect x="15.6" y="15.6" width="5.4" height="5.4" rx="1.3" fill="#7a1e1e" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          KABARI — aplikasi gagal dimuat
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(251,250,246,0.65)", maxWidth: 420 }}>
          Maaf, terjadi kesalahan fatal. Silakan muat ulang halaman ini.
        </p>
        {error.digest ? (
          <p style={{ margin: 0, fontSize: 12, color: "rgba(251,250,246,0.4)" }}>
            {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            border: "1px solid rgba(251,250,246,0.2)",
            borderRadius: 8,
            background: "rgba(251,250,246,0.08)",
            color: "#fbfaf6",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
