import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { apiGet, ApiError } from "@/lib/api-client";
import type { Notification } from "@/lib/types";

/**
 * BFF endpoint for the notifications live view.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, status: 401, message: "Tidak terautentikasi" },
      { status: 401 },
    );
  }

  try {
    const { data } = await apiGet<Notification[]>(
      "/notifications",
      session.accessToken,
    );
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { ok: false, status: err.statusCode, message: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { ok: false, status: 500, message: "Gagal memuat notifikasi" },
      { status: 500 },
    );
  }
}
