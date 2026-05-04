"use client";

import { useEffect } from "react";

const STORAGE_KEY = "terminalsync:cookie-consent-v1";

/**
 * Loads Rewardful's affiliate tracker only after the user has accepted
 * cookies. Without consent (or if the user picked "necessary only"), the
 * script never executes and no tracking cookie is set.
 *
 * Sequence:
 *  1. Always inject the inline queue snippet — it just defines
 *     window.rewardful as a no-op queue. No cookies, no fetch.
 *  2. If consent is "accepted" on mount → inject rw.js immediately.
 *  3. If consent is "necessary" or unset → wait for the
 *     "ts:cookies:accepted" event and inject then. Lets a user who
 *     rejects on first visit and accepts later still get attribution
 *     from the same session.
 *
 * Set the API key via NEXT_PUBLIC_REWARDFUL_API_KEY in Vercel env. With
 * no key, the component is a no-op so dev/preview without the key keeps
 * working.
 */
export function RewardfulLoader() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_REWARDFUL_API_KEY;
    if (!apiKey) return;

    // Inline queue — safe to define always; doesn't fetch or set cookies.
    if (typeof window !== "undefined" && !(window as unknown as { _rwq?: unknown })._rwq) {
      const inline = document.createElement("script");
      inline.text = `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`;
      document.head.appendChild(inline);
    }

    function injectMainScript() {
      // Idempotent: if rw.js is already loaded, skip.
      if (document.querySelector('script[data-rewardful]')) return;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://r.wdfl.co/rw.js";
      s.setAttribute("data-rewardful", apiKey!);
      document.head.appendChild(s);
    }

    let consent: string | null = null;
    try {
      consent = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode */
    }

    if (consent === "accepted") {
      injectMainScript();
      return;
    }

    // Wait for the user to accept later in the session.
    const onAccept = () => injectMainScript();
    window.addEventListener("ts:cookies:accepted", onAccept);
    return () => window.removeEventListener("ts:cookies:accepted", onAccept);
  }, []);

  return null;
}
