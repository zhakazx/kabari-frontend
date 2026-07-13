import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { apiGet, ApiError } from "@/lib/api-client";
import type { EventDashboardStats } from "@/lib/types";

/**
 * BFF endpoint for the live event dashboard. Reads the session, forwards
 * the call to the backend with the access token, and returns the same
 * envelope. Errors are returned as `{ ok: false, status, message }` so the
 * client can surface them inline without exposing internals.
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
    const { data } = await apiGet<EventDashboardStats>(
      `/events/${id}/dashboard`,
      session.accessToken,
    );
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { ok: false, status: err.statusCode, message: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { ok: false, status: 500, message: "Gagal memuat statistik" },
      { status: 500 },
    );
  }
}
