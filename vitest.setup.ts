// Vitest setup. The `server-only` shim throws when imported from anything
// other than a Server Component; tests run in plain Node, so we replace it
// with a no-op.
import { vi } from "vitest";

vi.mock("server-only", () => ({}));
