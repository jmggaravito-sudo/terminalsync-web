"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Auto-fire the download once on mount, and emit a `download_landed` event so
 * we can correlate landing-page → actual DMG fetch in Vercel Analytics.
 *
 * The `?direct=1` flag tells /api/download to skip its own gracias redirect
 * (if we add one later). Today /api/download is a plain 302 to the DMG; the
 * flag is forward-compatible.
 *
 * We use a hidden iframe instead of `window.location =` so the visitor stays
 * on /gracias — replacing the location would yank them away from the
 * post-download content we just spent effort showing them.
 */
export function GraciasClient({ lang, variant }: { lang: string; variant: "dev" | "consumer" }) {
  useEffect(() => {
    track("download_landed", { lang, variant });
    const iframe = document.createElement("iframe");
    iframe.src = "/api/download?direct=1";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    return () => {
      iframe.remove();
    };
  }, [lang, variant]);

  return null;
}
