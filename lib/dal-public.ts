import "server-only";

import { cache } from "react";
import { cacheLife } from "next/cache";

import { ApiError, apiGet, apiGetPaged } from "@/lib/api-client";
import type {
  Invitation,
  PageMeta,
  Template,
} from "@/lib/types";

export type TemplateQuery = {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
};

export type TemplateListResult = {
  items: Template[];
  meta: PageMeta;
};

function buildTemplateQuery({
  page,
  limit,
  category,
  keyword,
}: TemplateQuery): string {
  const params = new URLSearchParams();
  if (page && page > 1) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Published template catalog. Cached across requests (`use cache`) for a few
 * minutes so newly published templates surface quickly without re-hitting the
 * API on every visit. Args become the cache key.
 */
export const getPublishedTemplates = cache(
  async (query: TemplateQuery = {}): Promise<TemplateListResult> => {
    "use cache";
    cacheLife("minutes");
    const path = `/templates${buildTemplateQuery(query)}`;
    const result = await apiGetPaged<Template>(path);
    return { items: result.data, meta: result.meta };
  },
);

/** Single template detail. Cached per id, refreshed every few minutes. */
export const getTemplate = cache(
  async (id: string): Promise<Template | null> => {
    "use cache";
    cacheLife("minutes");
    try {
      const result = await apiGet<Template>(`/templates/${id}`);
      return result.data;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) return null;
      throw err;
    }
  },
);

export type InvitationFetchError = "not_found" | "inactive" | "unknown";

export type InvitationFetchResult =
  | { ok: true; invitation: Invitation }
  | { ok: false; error: InvitationFetchError };

/**
 * Per-request, token-specific data. NOT cached — every visitor's RSVP status
 * may differ. Caching would leak state across guests.
 */
export const getInvitationByToken = cache(
  async (token: string): Promise<InvitationFetchResult> => {
    try {
      const result = await apiGet<Invitation>(`/invitations/${token}`);
      return { ok: true, invitation: result.data };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 404) return { ok: false, error: "not_found" };
        if (err.statusCode === 403) return { ok: false, error: "inactive" };
      }
      return { ok: false, error: "unknown" };
    }
  },
);

export type QrCodeResult = { ok: true; dataUrl: string } | { ok: false };

export const getInvitationQrCode = cache(
  async (token: string): Promise<QrCodeResult> => {
    try {
      const result = await apiGet<{ qr_code_data_url: string }>(
        `/invitations/${token}/qr-code`,
      );
      if (!result.data?.qr_code_data_url) return { ok: false };
      return { ok: true, dataUrl: result.data.qr_code_data_url };
    } catch {
      return { ok: false };
    }
  },
);
