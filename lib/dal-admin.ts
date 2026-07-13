import "server-only";

import { cache } from "react";

import { ApiError, apiGet } from "@/lib/api-client";
import type {
  CreatorAnalytics,
  PageMeta,
  PlatformKpi,
  RevenueTrendPoint,
  SafeUser,
  Session,
  Template,
  User,
  UserListResponse,
  UserRole,
} from "@/lib/types";

/**
 * Admin DAL. Helpers here:
 *  - require a `Session` from `requireRole('admin')`,
 *  - use the access token from the session,
 *  - cache the result with `React.cache` so a single render never re-fetches.
 *
 * The `User` payload from the backend still carries `password_hash` (see
 * openapi.yaml §User). Every user returned to a Server Component is mapped
 * to `SafeUser` before it can leak out of this module.
 */

function toSafeUser(raw: User): SafeUser {
  const { password_hash: _ignored, ...rest } = raw;
  void _ignored;
  return rest;
}

export type AdminTemplatesQuery = {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
  status?: string;
};

export type AdminTemplatesResult = {
  items: Template[];
  meta: PageMeta;
  counts: Record<string, number>;
};

function buildAdminTemplatesQuery({
  page,
  limit,
  category,
  keyword,
  status,
}: AdminTemplatesQuery): string {
  const params = new URLSearchParams();
  if (page && page > 1) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  if (status) params.set("status", status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export type AdminUsersQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: UserRole;
};

export type AdminUsersResult = {
  items: SafeUser[];
  meta: PageMeta;
  counts: Record<string, number>;
};

function buildAdminUsersQuery(query: AdminUsersQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.role) params.set("role", query.role);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** `GET /users` — paginated list with search, role filter, and role counts. */
export const getUsers = cache(
  async (session: Session, query: AdminUsersQuery = {}): Promise<AdminUsersResult> => {
    const path = `/users${buildAdminUsersQuery(query)}`;
    const result = await apiGet<UserListResponse>(path, session.accessToken);
    const raw = result.data;
    if (!raw) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit: 20, total_pages: 0 },
        counts: { admin: 0, pelanggan: 0, kreator: 0, penerima_tamu: 0 },
      };
    }
    return {
      items: (raw.data ?? []).map(toSafeUser),
      meta: raw.meta ?? { total: 0, page: 1, limit: 20, total_pages: 0 },
      counts: raw.counts ?? { admin: 0, pelanggan: 0, kreator: 0, penerima_tamu: 0 },
    };
  },
);

/** `GET /users/{id}` — a single user. Returns `null` on 404. */
export const getUser = cache(
  async (session: Session, id: string): Promise<SafeUser | null> => {
    try {
      const { data } = await apiGet<User>(
        `/users/${id}`,
        session.accessToken,
      );
      return toSafeUser(data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

/**
 * `GET /templates/admin/all` — paginated, all statuses. The admin review
 * queue uses this; the queue itself filters by status client-side because
 * the spec does not expose a server-side `status` filter.
 */
export const getAllTemplates = cache(
  async (
    session: Session,
    query: AdminTemplatesQuery = {},
  ): Promise<AdminTemplatesResult> => {
    const path = `/templates/admin/all${buildAdminTemplatesQuery(query)}`;
    const result = await apiGet<{ data: Template[]; meta: PageMeta; counts: Record<string, number> }>(path, session.accessToken);
    const raw = result.data;
    return {
      items: raw?.data ?? [],
      meta: raw?.meta ?? { total: 0, page: 1, limit: 50, total_pages: 0 },
      counts: raw?.counts ?? { draft: 0, pending_review: 0, published: 0, rejected: 0 },
    };
  },
);

/** `GET /analytics/platform-kpi` — totals + four breakdown maps. */
export const getPlatformKpi = cache(
  async (session: Session): Promise<PlatformKpi | null> => {
    try {
      const { data } = await apiGet<PlatformKpi>(
        "/analytics/platform-kpi",
        session.accessToken,
      );
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

/** `GET /analytics/creators` — leaderboard, royalty DESC. */
export const getCreatorAnalytics = cache(
  async (session: Session): Promise<CreatorAnalytics[]> => {
    const { data } = await apiGet<CreatorAnalytics[]>(
      "/analytics/creators",
      session.accessToken,
    );
    return data ?? [];
  },
);

/**
 * `GET /analytics/revenue-trend?days=` — daily revenue + order counts.
 * The endpoint accepts `days` as an integer; the backend defaults to 30
 * when omitted. We keep the param explicit so the URL is shareable.
 */
export const getRevenueTrend = cache(
  async (
    session: Session,
    days: number = 30,
  ): Promise<RevenueTrendPoint[]> => {
    const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
    const { data } = await apiGet<RevenueTrendPoint[]>(
      `/analytics/revenue-trend?days=${safeDays}`,
      session.accessToken,
    );
    return data ?? [];
  },
);
