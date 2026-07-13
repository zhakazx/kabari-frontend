import "server-only";

import { cache } from "react";

import { ApiError, apiGet } from "@/lib/api-client";
import type { CheckIn, PageMeta, Session } from "@/lib/types";

/**
 * Penerima tamu DAL. Every helper here:
 *  - requires a `Session` (callers get it from `requireRole('penerima_tamu')`),
 *  - uses the access token from the session,
 *  - caches the result with `React.cache` so a single render never re-fetches.
 *
 * The `Check-ins` endpoints in the backend spec accept either the
 * `pelanggan` or `penerima_tamu` role, so the helpers here are shared
 * with the pelanggan DAL in spirit. Kept separate for symmetry with the
 * other role-scoped DAL files and to make the dependency direction
 * obvious (gate pages import from here, never from `dal-pelanggan`).
 */

export type CheckInsQuery = {
  page?: number;
  limit?: number;
};

export type CheckInsResult = {
  items: CheckIn[];
  meta: PageMeta;
};

function buildCheckInsQuery(query: CheckInsQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getCheckInsByEvent = cache(
  async (session: Session, eventId: string, query: CheckInsQuery = {}): Promise<CheckInsResult> => {
    try {
      const path = `/check-ins/event/${eventId}${buildCheckInsQuery(query)}`;
      const result = await apiGet<{ data: CheckIn[]; meta: PageMeta }>(
        path,
        session.accessToken,
      );
      return {
        items: result.data?.data ?? [],
        meta: result.data?.meta ?? { total: 0, page: 1, limit: 50, total_pages: 0 },
      };
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return { items: [], meta: { total: 0, page: 1, limit: 50, total_pages: 0 } };
      }
      throw err;
    }
  },
);
