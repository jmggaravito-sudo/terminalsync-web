# AGENTS.md

Project context for AI coding agents (opencode, Cursor, Claude Code, Codex, etc.).

## What this is

`terminalsync-web` is the marketing site, marketplace, and billing surface for
TerminalSync. Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4,
deployed to Vercel. Auth + DB live in Supabase; payments in Stripe (subs +
Connect Express for the marketplace); transactional mail via Resend; some
edge logic on Cloudflare Workers under `cloudflare/`.

## Scripts

- `npm run dev` — Next dev server on port 3131 (see `NEXT_PUBLIC_SITE_URL`).
- `npm run build` — production build.
- `npm run start` — run the production build locally.
- `npm run lint` — `next lint`.
- `npm run typecheck` — `tsc --noEmit`. Run this before pushing; the build is
  strict and will fail on type errors.

## Layout

- `src/app/[lang]/...` — localized routes. Locales live in `src/content` and
  are matched/redirected by `src/middleware.ts`. Default is `es`, `en` is the
  other supported locale. Don't add hardcoded `/es/` or `/en/` links inside
  components — read `lang` from the route params.
- `src/app/api/...` — route handlers (Stripe webhooks, marketplace, admin,
  cron, download, welcome triggers).
- `src/app/oauth`, `src/app/auth` — language-agnostic, do not localize.
- `src/components/` — shared UI. `landing/`, `dev-landing/`, `marketplace/`,
  `brand/`, `ui/`, `analytics/` are the sub-buckets.
- `src/lib/` — server + shared helpers. `supabase/` for browser+server
  clients; `supabaseAdmin.ts` is service-role and server-only (never import
  from a client component).
- `content/` — MDX/markdown sources for `cli-tools`, `connectors`, `skills`.
  Loaded via `gray-matter` + `remark` through `src/lib/cliTools.ts`,
  `connectors.ts`, `skills.ts`.
- `supabase/migrations/` — numbered SQL migrations. New migrations go in a
  new file, never edit a shipped one.
- `cloudflare/workers/` — edge workers deployed separately from Vercel.
- `scripts/` — one-off Node/Python ops scripts (Stripe setup, outreach,
  ingestion, backfills). Not part of the build.
- `emails/`, `legal/` — Resend templates and legal copy.

## Conventions

- Path alias `@/*` -> `src/*`.
- TypeScript `strict: true`. No `any` unless there's a comment explaining why.
- Server-only modules (anything that reads `SUPABASE_SERVICE_ROLE_KEY`,
  `STRIPE_SECRET_KEY`, `WELCOME_FLOW_SECRET`, etc.) must not be imported from
  client components. The convention is to keep them under `src/lib/` and
  import only from `src/app/api/...` or server components.
- `NEXT_PUBLIC_*` env vars are the only ones safe to read in the browser.
- Comments in `src/`, `scripts/`, and `supabase/migrations/` are intentionally
  prose-heavy ("why", not "what"). Match that tone when editing existing
  files; for new code, prefer no comments unless the why is non-obvious.

## Security

- CSP, HSTS, Permissions-Policy, frame-ancestors are set in `next.config.ts`.
  If you add a third-party script, font, image host, or fetch target, update
  the relevant directive there — the build will not warn you, but production
  will silently break.
- Stripe webhook signature verification lives in `src/app/api/webhooks/...`.
  Never bypass it.
- The marketplace approval flow keys on `ADMIN_EMAILS`. Don't ship code that
  trusts a client-provided "is admin" flag.

## Things not to touch without checking first

- `supabase/migrations/000*.sql` already in `main` — write a new migration
  instead.
- `next.config.ts` CSP — adding `'unsafe-inline'` to `connect-src` or
  loosening `frame-ancestors` is almost never the right fix.
- `.env.example` is documentation; the real secrets live in Vercel and never
  in the repo. `.env`, `.env*.local`, `.env.production` are gitignored.

## Local setup

1. `cp .env.example .env.local` and fill in at minimum: Stripe test keys,
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
2. `npm install`
3. `npm run dev` -> http://localhost:3131
4. Apply Supabase migrations against your dev project before exercising the
   marketplace, discovery, or bundles routes.
