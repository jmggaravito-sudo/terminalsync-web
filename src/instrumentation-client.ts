// Sentry del navegador, SOLO con consentimiento de analítica.
//
// Antes se inicializaba al cargar cada página, con Session Replay sin
// enmascarar. Ahora:
//  - no se importa ni se inicializa el SDK hasta que hay consentimiento de
//    "Analítica y errores" (src/lib/consent.ts), ni en la primera visita ni
//    mientras la decisión sea "rechazar";
//  - se inicializa sin Session Replay (decisión conservadora hasta que el
//    abogado valide la categoría; ver docs/handoffs/espana/11, tarea W2).
// Si falta NEXT_PUBLIC_SENTRY_DSN no hace nada, como antes.

import {
  CONSENT_EVENT,
  analyticsAllowed,
  browserStorage,
  effectiveConsent,
  type ConsentCategories,
} from "@/lib/consent";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
let started = false;

async function startSentry() {
  if (started || !dsn) return;
  started = true;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // 10% of transactions traced in prod; 100% locally.
    tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,
    // Sin Session Replay: no se graba texto ni medios de la pantalla.
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    sendDefaultPii: false,
  });
}

if (dsn && typeof window !== "undefined") {
  if (analyticsAllowed(effectiveConsent(browserStorage()))) {
    void startSentry();
  } else {
    window.addEventListener(CONSENT_EVENT, (ev) => {
      if (analyticsAllowed((ev as CustomEvent<ConsentCategories>).detail)) void startSentry();
    });
  }
}
