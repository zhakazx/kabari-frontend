<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Required checks before finishing a task

Always run the four checks below in order before declaring a task done. The
first failure stops the chain.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run build` runs the **Cache Components** pass and the
`unstable_instant` validator — both will fail the build on structural
problems, so a green `build` is the strongest signal that the app is
healthy.

## Library docs

When unsure about a Next.js / React / Tailwind / Zod / SWR / jose API,
fetch the bundled docs first:

- Next.js: `node_modules/next/dist/docs/01-app/…`
- Tailwind v4 utilities are defined inline in `app/globals.css` (look for
  `@utility` blocks for project-specific tokens like `qr-grid`,
  `seal-ring`, `scan-line`).

## Project conventions

- Server components by default. Add `"use client"` only when the component
  needs state, effects, browser APIs, or a React hook from a client-only
  library.
- All authenticated data lives behind a DAL in `lib/dal-*.ts`; the DAL
  reads the session cookie and forwards the access token to the backend.
  Never call the backend directly from a server component.
- Use `Server Actions` (files in `actions/`) for mutations; the forms
  call them via `useActionState`.
- The `lib/realtime.ts` hook handles live updates via SWR polling; it
  also opens a WebSocket if `NEXT_PUBLIC_REALTIME_URL` is set. The
  BFF endpoints under `app/api/live/…` are the fetch targets.
- Images: use `next/image` via the `SafeImage` component. It falls back
  to a native `<img>` for hosts not in `next.config.ts`
  `images.remotePatterns`.

## Common pitfalls

- `unstable_instant` cannot be used in Client Components. Use it on
  `layout.tsx` or `page.tsx` only.
- `next/dynamic` with `ssr: false` is only allowed from a Client
  Component. Wrap dynamic imports in a `"use client"` shim
  (`QrScannerClient` is the pattern).
- The `(dashboard)/layout.tsx` and `(admin)/layout.tsx` export
  `unstable_instant = false` because they read cookies. The pages under
  them can still be validated individually if needed.
- The `server-only` shim throws when imported from a non-React context.
  The vitest setup mocks it to a no-op so unit tests can import the
  api-client.

<!-- END:nextjs-agent-rules -->

