import "server-only";

import { cache } from "react";

import { ApiError, apiGet, apiGetPaged } from "@/lib/api-client";
import type { PageMeta } from "@/lib/types";
import type { Session, Template, TemplateSale } from "@/lib/types";

/**
 * Kreator DAL. Every helper here:
 *  - requires a `Session` (callers get it from `requireRole('kreator')`),
 *  - uses the access token from the session,
 *  - caches the result with `React.cache` so a single render never re-fetches.
 *
 * Like the pelanggan DAL, caching is per-request — the access token is part
 * of the auth header and changes between requests, so we never want a
 * `cache()` to outlive the request.
 */

export type MyTemplateQuery = {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
};

export type MyTemplateListResult = {
  items: Template[];
  meta: PageMeta;
};

function buildMyTemplatesQuery({
  page,
  limit,
  category,
  keyword,
}: MyTemplateQuery): string {
  const params = new URLSearchParams();
  if (page && page > 1) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Templates owned by the current kreator. Backed by
 * `GET /templates/creator/my-templates`. Paginated, filterable.
 */
export const getMyTemplates = cache(
  async (
    session: Session,
    query: MyTemplateQuery = {},
  ): Promise<MyTemplateListResult> => {
    const path = `/templates/creator/my-templates${buildMyTemplatesQuery(query)}`;
    const result = await apiGetPaged<Template>(path, session.accessToken);
    return { items: result.data, meta: result.meta };
  },
);

export type RoyaltyQuery = {
  page?: number;
  limit?: number;
};

export type RoyaltyTotals = {
  total_royalty: number;
  paid_amount: number;
  pending_amount: number;
  paid_count: number;
  pending_count: number;
};

export type RoyaltyResult = {
  items: TemplateSale[];
  meta: PageMeta;
  totals: RoyaltyTotals;
};

function buildRoyaltyQuery(query: RoyaltyQuery): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Royalty ledger for the current kreator. Backed by
 * `GET /orders/royalties/my-royalties`. Each `TemplateSale` carries the
 * `template` and `order` relations, ordered by `created_at DESC`.
 */
export const getMyRoyalties = cache(
  async (session: Session, query: RoyaltyQuery = {}): Promise<RoyaltyResult> => {
    try {
      const path = `/orders/royalties/my-royalties${buildRoyaltyQuery(query)}`;
      const result = await apiGet<{ data: TemplateSale[]; meta: PageMeta; totals: RoyaltyTotals }>(
        path,
        session.accessToken,
      );
      return {
        items: result.data?.data ?? [],
        meta: result.data?.meta ?? { total: 0, page: 1, limit: 20, total_pages: 0 },
        totals: result.data?.totals ?? { total_royalty: 0, paid_amount: 0, pending_amount: 0, paid_count: 0, pending_count: 0 },
      };
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return { items: [], meta: { total: 0, page: 1, limit: 20, total_pages: 0 }, totals: { total_royalty: 0, paid_amount: 0, pending_amount: 0, paid_count: 0, pending_count: 0 } };
      }
      throw err;
    }
  },
);
