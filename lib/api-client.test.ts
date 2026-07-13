import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// The api-client reads `env` at module load — set required env vars before
// importing so Zod validation passes during the test run.
process.env.API_BASE_URL = "http://localhost:8000/api/v1";
process.env.SESSION_SECRET = "test-secret-must-be-long-enough-to-pass";
process.env.SESSION_COOKIE_NAME = "kabari_session";
process.env.SESSION_MAX_AGE_SECONDS = "604800";
process.env.NEXT_PUBLIC_APP_NAME = "KABARI";

const { apiGet, apiJson } = await import("./api-client");

type FetchFn = typeof fetch;
const originalFetch = globalThis.fetch;

function mockFetch(
  responder: (input: string, init?: RequestInit) => Response | Promise<Response>,
): FetchFn {
  const fn = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) =>
      responder(typeof input === "string" ? input : String(input), init),
  ) as unknown as FetchFn;
  globalThis.fetch = fn;
  return fn;
}

beforeEach(() => {
  // Each test gets a fresh mock — assign in the test body.
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("apiGet envelope handling", () => {
  it("returns data from a { success: true, data, meta } envelope", async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({ success: true, data: { id: "1", name: "Kabar" } }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const result = await apiGet<{ id: string; name: string }>("/anything");
    expect(result.data).toEqual({ id: "1", name: "Kabar" });
    expect(result.meta).toBeUndefined();
  });

  it("extracts meta when present", async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({
          success: true,
          data: [{ id: "1" }],
          meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const result = await apiGet<unknown[]>("/things");
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      total_pages: 1,
    });
  });

  it("throws ApiError on a { success: false } envelope", async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({
          success: false,
          statusCode: 422,
          message: ["name wajib diisi"],
          timestamp: "2025-01-01T00:00:00Z",
          path: "/templates",
        }),
        { status: 422, headers: { "content-type": "application/json" } },
      ),
    );
    await expect(apiGet("/templates")).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 422,
      messages: ["name wajib diisi"],
    });
  });

  it("falls back to statusText when error body is empty", async () => {
    mockFetch(
      () =>
        new Response("Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
    );
    await expect(apiGet("/x")).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 500,
      messages: ["Internal Server Error"],
    });
  });
});

describe("apiJson", () => {
  it("serialises the body and sets content-type only when there is a body", async () => {
    let capturedContentType: string | null | undefined;
    mockFetch((_input, init) => {
      capturedContentType = (init?.headers as Record<string, string> | undefined)?.[
        "Content-Type"
      ];
      return new Response(JSON.stringify({ success: true, data: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    await apiJson("/x", "POST", { hello: "world" });
    expect(capturedContentType).toBe("application/json");

    let noBodyContentType: string | undefined;
    mockFetch((_input, init) => {
      noBodyContentType = (init?.headers as Record<string, string> | undefined)?.[
        "Content-Type"
      ];
      return new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    await apiJson("/x", "DELETE", null);
    expect(noBodyContentType).toBeUndefined();
  });
});
