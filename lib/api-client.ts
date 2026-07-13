import "server-only";

import { env } from "@/lib/env";
import type {
  PageMeta,
  Paginated,
  SuccessEnvelope,
  ErrorEnvelope,
} from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public messages: string[],
  ) {
    super(messages.join(", "));
    this.name = "ApiError";
  }
}

export type ApiResult<T> = { data: T; meta?: PageMeta };
export type ApiPagedResult<T> = { data: T[]; meta: PageMeta };

function buildUrl(path: string): string {
  return `${env.API_BASE_URL}${path}`;
}

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function toMessages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((m) => String(m));
  if (raw === null || raw === undefined) return [];
  return [String(raw)];
}

async function unwrap<T>(res: Response): Promise<ApiResult<T>> {
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  let body: unknown;

  try {
    body = isJson ? await res.json() : undefined;
  } catch {
    body = undefined;
  }

  if (!res.ok) {
    if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      const statusCode =
        typeof b.statusCode === "number" ? b.statusCode : res.status;
      const messages = toMessages(b.message);
      throw new ApiError(
        statusCode,
        messages.length ? messages : [res.statusText],
      );
    }
    throw new ApiError(res.status, [res.statusText]);
  }

  if (body && typeof body === "object") {
    if ((body as SuccessEnvelope<T>).success === true) {
      const ok = body as SuccessEnvelope<T>;
      return { data: ok.data, meta: ok.meta };
    }
    if ((body as ErrorEnvelope).success === false) {
      const err = body as ErrorEnvelope;
      throw new ApiError(err.statusCode, err.message);
    }
  }

  return { data: body as T, meta: undefined };
}

export async function apiGet<T>(
  path: string,
  token?: string,
): Promise<ApiResult<T>> {
  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: authHeaders(token),
  });
  return unwrap<T>(res);
}

export async function apiJson<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  token?: string,
): Promise<ApiResult<T>> {
  const headers = authHeaders(token);
  const hasBody = body !== undefined && body !== null;
  if (hasBody) headers["Content-Type"] = "application/json";

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  return unwrap<T>(res);
}

export async function apiForm<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
  token?: string,
): Promise<ApiResult<T>> {
  const res = await fetch(buildUrl(path), {
    method,
    headers: authHeaders(token),
    body: formData,
  });
  return unwrap<T>(res);
}

export async function apiGetPaged<T>(
  path: string,
  token?: string,
): Promise<ApiPagedResult<T>> {
  const result = await apiGet<Paginated<T>>(path, token);
  return { data: result.data.data, meta: result.data.meta };
}
