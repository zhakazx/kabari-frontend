import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KABARI — Undangan Digital & Manajemen Acara";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #16140f 0%, #1d1a13 60%, #2b2014 100%)",
          color: "#fbfaf6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "rgba(251,250,246,0.7)",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#c9861e",
            }}
          />
          KABARI
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Setiap tamu,
            <br />
            satu kabar hangat.
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "rgba(251,250,246,0.65)",
              maxWidth: 780,
            }}
          >
            Buat undangan digital, kelola RSVP, dan pindai QR tamu di
            gerbang — semuanya dalam satu platform yang tenang.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(251,250,246,0.45)",
            letterSpacing: 1.5,
          }}
        >
          <span>kabari.id</span>
          <span>Undangan digital · Manajemen acara</span>
        </div>
      </div>
    ),
    size,
  );
}
