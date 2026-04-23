// Browser-side Sentry init. Next.js 15+ picks this up automatically from
// the src/ root. No-op if NEXT_PUBLIC_SENTRY_DSN is absent so the site
// ships without it and you enable later by pasting the DSN in Vercel.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // 10% of transactions traced in prod; 100% locally.
    tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,
    // Session replay on errors — helpful for debugging UI regressions.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}
