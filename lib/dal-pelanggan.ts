import "server-only";

import { cache } from "react";

import { ApiError, apiGet, apiGetPaged } from "@/lib/api-client";
import type { PageMeta, Session } from "@/lib/types";
import type {
  TemplateListResult,
  TemplateQuery,
} from "@/lib/dal-public";
import type {
  Event,
  EventAnalytics,
  EventDashboardStats,
  Invitation,
  Notification,
  Order,
  Template,
} from "@/lib/types";

/**
 * Pelanggan DAL. Every helper here:
 *  - requires a `Session` (callers get it from `requireRole('pelanggan')`),
 *  - uses the access token from the session,
 *  - caches the result with `React.cache` so a single render never re-fetches.
 *
 * Caching is *per-request*. The session contains a JWT that can change
 * between requests, and access token is part of the auth header — so we
 * never want a `cache()` to outlive the request.
 */

async function authed<T>(
  path: string,
  token: string,
  parser: (raw: T) => T = (x) => x,
): Promise<T> {
  const { data } = await apiGet<T>(path, token);
  return parser(data);
}

export type PelangganEventsQuery = {
  page?: number;
  limit?: number;
};

export type PelangganEventsResult = {
  items: Event[];
  meta: PageMeta;
  counts: { active: number; draft: number; completed: number; cancelled: number };
};

function buildPelangganEventsQuery(query: PelangganEventsQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getMyEvents = cache(
  async (session: Session, query: PelangganEventsQuery = {}): Promise<PelangganEventsResult> => {
    const path = `/events${buildPelangganEventsQuery(query)}`;
    const result = await apiGet<{ data: Event[]; meta: PageMeta; counts: { active: number; draft: number; completed: number; cancelled: number } }>(path, session.accessToken);
    return {
      items: result.data?.data ?? [],
      meta: result.data?.meta ?? { total: 0, page: 1, limit: 20, total_pages: 0 },
      counts: result.data?.counts ?? { active: 0, draft: 0, completed: 0, cancelled: 0 },
    };
  },
);

export const getEvent = cache(
  async (session: Session, id: string): Promise<Event | null> => {
    try {
      return await authed<Event>(`/events/${id}`, session.accessToken);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

export const getEventDashboardStats = cache(
  async (
    session: Session,
    eventId: string,
  ): Promise<EventDashboardStats | null> => {
    try {
      return await authed<EventDashboardStats>(
        `/events/${eventId}/dashboard`,
        session.accessToken,
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

export type InvitationsQuery = {
  page?: number;
  limit?: number;
};

export type InvitationsResult = {
  items: Invitation[];
  meta: PageMeta;
  counts: { confirmed: number; checked_in: number };
};

function buildInvitationsQuery(query: InvitationsQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getInvitationsByEvent = cache(
  async (session: Session, eventId: string, query: InvitationsQuery = {}): Promise<InvitationsResult> => {
    const path = `/invitations/event/${eventId}${buildInvitationsQuery(query)}`;
    const result = await apiGet<{ data: Invitation[]; meta: PageMeta; counts: { confirmed: number; checked_in: number } }>(path, session.accessToken);
    return {
      items: result.data?.data ?? [],
      meta: result.data?.meta ?? { total: 0, page: 1, limit: 50, total_pages: 0 },
      counts: result.data?.counts ?? { confirmed: 0, checked_in: 0 },
    };
  },
);

export type PelangganOrdersQuery = {
  page?: number;
  limit?: number;
};

export type PelangganOrdersResult = {
  items: Order[];
  meta: PageMeta;
  counts: { pending: number; paid: number; failed: number; cancelled: number };
};

function buildPelangganOrdersQuery(query: PelangganOrdersQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getMyOrders = cache(
  async (session: Session, query: PelangganOrdersQuery = {}): Promise<PelangganOrdersResult> => {
    const path = `/orders${buildPelangganOrdersQuery(query)}`;
    const result = await apiGet<{ data: Order[]; meta: PageMeta; counts: { pending: number; paid: number; failed: number; cancelled: number } }>(path, session.accessToken);
    return {
      items: result.data?.data ?? [],
      meta: result.data?.meta ?? { total: 0, page: 1, limit: 20, total_pages: 0 },
      counts: result.data?.counts ?? { pending: 0, paid: 0, failed: 0, cancelled: 0 },
    };
  },
);

export const getOrder = cache(
  async (session: Session, id: string): Promise<Order | null> => {
    try {
      return await authed<Order>(`/orders/${id}`, session.accessToken);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

export type NotificationsQuery = {
  page?: number;
  limit?: number;
};

export type NotificationsResult = {
  items: Notification[];
  meta: PageMeta;
};

function buildNotificationsQuery(query: NotificationsQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const getNotifications = cache(
  async (session: Session, query: NotificationsQuery = {}): Promise<NotificationsResult> => {
    const path = `/notifications${buildNotificationsQuery(query)}`;
    const result = await apiGet<{ data: Notification[]; meta: PageMeta }>(path, session.accessToken);
    return {
      items: result.data?.data ?? [],
      meta: result.data?.meta ?? { total: 0, page: 1, limit: 50, total_pages: 0 },
    };
  },
);

export const getEventAnalytics = cache(
  async (
    session: Session,
    eventId: string,
  ): Promise<EventAnalytics | null> => {
    try {
      return await authed<EventAnalytics>(
        `/analytics/events/${eventId}`,
        session.accessToken,
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

/**
 * Published templates the pelanggan can pick from when creating an event.
 * The catalog is also exposed by the public DAL (`getPublishedTemplates`),
 * but the pelanggan flow needs to read it inside a route guarded by
 * `requireRole('pelanggan')` and we want the result to be cached per
 * session, not mixed with the public call site. Falls back to the public
 * list with no token — the endpoint allows both auth and public access.
 */
export const getCreatableTemplates = cache(
  async (
    session: Session,
    query: TemplateQuery = {},
  ): Promise<TemplateListResult> => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.category) params.set("category", query.category);
    if (query.keyword) params.set("keyword", query.keyword);
    const qs = params.toString();
    const path = `/templates${qs ? `?${qs}` : ""}`;
    const result = await apiGetPaged<Template>(path, session.accessToken);
    return { items: result.data, meta: result.meta };
  },
);
