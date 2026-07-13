import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * BFF proxy for the public invitation QR code. The backend returns a
 * `data:image/png;base64,…` envelope; we strip the envelope and stream the
 * raw PNG bytes so external consumers (e.g. a printing tool) can fetch
 * `GET /api/qr/<token>.png` directly.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const url = `${env.API_BASE_URL}/invitations/${encodeURIComponent(token)}/qr-code`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return NextResponse.json(
      { success: false, message: "Tidak dapat menghubungi server" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json(
        { success: false, message: "Undangan tidak ditemukan" },
        { status: 404 },
      );
    }
    if (res.status === 403) {
      return NextResponse.json(
        { success: false, message: "Acara belum aktif" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal memuat QR code" },
      { status: res.status },
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Respons tidak valid" },
      { status: 502 },
    );
  }

  const dataUrl =
    body && typeof body === "object"
      ? (body as { data?: { qr_code_data_url?: string } }).data?.qr_code_data_url
      : undefined;

  if (!dataUrl || !dataUrl.startsWith("data:image/png;base64,")) {
    return NextResponse.json(
      { success: false, message: "QR code tidak ditemukan" },
      { status: 502 },
    );
  }

  const base64 = dataUrl.slice("data:image/png;base64,".length);
  const bytes = Buffer.from(base64, "base64");

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="qr-${token}.png"`,
    },
  });
}
