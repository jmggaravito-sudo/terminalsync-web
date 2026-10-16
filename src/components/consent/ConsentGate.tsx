"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CtaTracker } from "@/components/analytics/CtaTracker";
import { useConsent } from "@/components/consent/useConsent";
import { analyticsAllowed, landingSourceFor } from "@/lib/consent";

/**
 * ÚNICO sitio donde se montan Vercel Analytics, Speed Insights y el medidor de
 * clics. Sin consentimiento de analítica no renderiza nada: ni script, ni
 * evento, ni cookie.
 *
 * También crea la cookie de atribución `tsync_landing` (antes la ponía el
 * middleware en la primera visita, sin consentimiento) y solo si hay
 * consentimiento de analítica.
 */
export function ConsentGate() {
  const consent = useConsent();
  const allowed = analyticsAllowed(consent);

  useEffect(() => {
    if (!allowed) return;
    try {
      if (/(?:^|;\s*)tsync_landing=/.test(document.cookie)) return;
      const source = landingSourceFor(window.location.pathname);
      if (!source) return;
      document.cookie = `tsync_landing=${source}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`;
    } catch {
      /* cookies bloqueadas */
    }
  }, [allowed]);

  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <CtaTracker />
    </>
  );
}
