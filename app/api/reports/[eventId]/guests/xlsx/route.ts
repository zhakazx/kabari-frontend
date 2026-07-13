import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/dal";
import { env } from "@/lib/env";

/**
 * BFF proxy for the event's XLSX guest book. The backend returns a binary
 * `.xlsx` file bypassing the JSON envelope; we forward the bytes with the
 * correct `Content-Type` and `Content-Disposition` so the browser downloads
 * the file. Authorization is enforced by `requireRole('pelanggan')`; the
 * backend also enforces event ownership and responds with `403` if the
 * caller doesn't own it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await requireRole("pelanggan");
  const { eventId } = await params;

  const url = `${env.API_BASE_URL}/reports/${encodeURIComponent(eventId)}/guests/xlsx`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  } catch {
    return NextResponse.json(
      { message: "Tidak dapat menghubungi server" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    let message = "Gagal mengunduh buku tamu";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(", ");
      else if (typeof body.message === "string") message = body.message;
    } catch {
      // ignore — fall back to the default message
    }
    return NextResponse.json({ message }, { status: res.status });
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="buku-tamu-${eventId}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
