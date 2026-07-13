# KABARI Frontend

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.

The full implementation plan lives in [`docs/`](./docs); the **phase-by-phase
roadmap** starts at [`docs/README.md`](./docs/README.md). This README only
covers local development.

---

## Prerequisites

- **Node.js 22+** (the project relies on Next.js 16 + the App Router
  Cache Components flag, both of which require a recent runtime).
- **npm 10+** (or pnpm/yarn — scripts are identical).
- A running **KABARI NestJS backend** (the `API_BASE_URL` env var points to
  it; default `http://localhost:8000/api/v1`).

## Install

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (at minimum `API_BASE_URL` and `SESSION_SECRET`).
Generate the session secret with:

```bash
openssl rand -base64 32
```

## Commands

| Command            | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `npm run dev`      | Start the dev server with Turbopack at <http://localhost:3000>.      |
| `npm run build`    | Production build (`next build`). Runs the full Cache Components pass. |
| `npm run start`    | Run the production build (after `build`).                            |
| `npm run lint`     | ESLint (`next/core-web-vitals` + TS rules). Treat warnings as errors. |
| `npm run typecheck`| TypeScript without emit (`tsc --noEmit`).                            |
| `npm run test`     | Vitest unit suite (`api-client`, `utils` formatters).                |
| `npm run test:watch`| Vitest in watch mode.                                               |

Before committing, run all four checks:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Environment variables

See [`.env.example`](./.env.example) for the full list with comments. The
server-only block (`API_BASE_URL`, `SESSION_SECRET`, …) is validated by
[`lib/env.ts`](./lib/env.ts) on import. The `NEXT_PUBLIC_*` block is safe
to expose to the client.

| Var                              | Required | Purpose                                                  |
| -------------------------------- | -------- | -------------------------------------------------------- |
| `API_BASE_URL`                   | ✅       | Backend base URL with `/api/v1`.                         |
| `SESSION_SECRET`                 | ✅       | HS256 secret for the `jose` session cookie (≥ 16 chars). |
| `SESSION_COOKIE_NAME`            |          | Defaults to `kabari_session`.                            |
| `SESSION_MAX_AGE_SECONDS`        |          | Defaults to `604800` (7 days).                           |
| `NEXT_PUBLIC_APP_NAME`           |          | Branding shown in the UI.                                |
| `NEXT_PUBLIC_REALTIME_URL`       |          | Optional WebSocket URL for live dashboards.              |
| `NEXT_PUBLIC_SITE_URL`           |          | Public site origin (used in sitemap, robots, OG URLs).   |
| `NEXT_PUBLIC_IMAGE_HOSTNAMES`    |          | CSV of allowed `next/image` remote hosts.                 |

## Project structure

```
app/             Next.js App Router routes, layout, error boundaries
actions/         "use server" Server Actions (mutations)
components/      Shared UI primitives + role-scoped feature components
lib/             Server-only DALs, API client, env, session, utilities
public/          Static assets
proxy.ts         Route guard (auth + role redirects)
vitest.config.ts Unit test configuration
```

Read [`docs/02-project-structure.md`](./docs/02-project-structure.md) for
the detailed conventions.

## Notes for AI agents

- **Next.js 16 is not the Next.js you remember.** Read
  [`docs/12-nextjs-16-reference.md`](./docs/12-nextjs-16-reference.md)
  before touching routing, caching, or metadata.
- Always run `npm run lint && npm run typecheck && npm run build` after
  edits — Cache Components catches structural issues at build time and
  `unstable_instant` validation will fail the build if Suspense
  boundaries are misplaced.
