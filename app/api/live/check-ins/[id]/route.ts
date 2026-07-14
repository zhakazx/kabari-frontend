import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { apiGet, ApiError } from "@/lib/api-client";
import type { CheckIn } from "@/lib/types";

/**
 * BFF endpoint for the gate history live view.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, status: 401, message: "Tidak terautentikasi" },
      { status: 401 },
    );
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, status: 400, message: "ID acara tidak diberikan" },
      { status: 400 },
    );
  }

  try {
    const result = await apiGet<{ data: CheckIn[] }>(
      `/check-ins/event/${id}`,
      session.accessToken,
    );
    return NextResponse.json({ ok: true, data: result.data?.data ?? [] });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { ok: false, status: err.statusCode, message: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { ok: false, status: 500, message: "Gagal memuat check-in" },
      { status: 500 },
    );
  }
}
