// Next.js instrumentation hook — runs once per runtime before the app
// handles any request. We use it to wire Sentry if a DSN is provided.
// Without a DSN, this is a no-op so the site keeps working.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export async function register() {
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: 0.1,
    });
  }
}

// Re-export the capture helper so client code can call it on handled errors.
export const onRequestError = Sentry.captureRequestError;
