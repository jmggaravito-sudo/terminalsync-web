"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Single delegated listener for every `[data-cta]` element on the page.
 *
 * Components mark their CTAs with `data-cta="hero-primary"` etc. — there are
 * already ~7 of them. Editing each component to attach an onClick would
 * conflict with whoever is editing those files concurrently. This listener
 * sits at the document root, fires once per click, and never needs to know
 * about new CTAs added later (they just need the data attribute).
 *
 * Also emits `scroll_75` once per page load when the visitor scrolls 75% of
 * the way down — a soft "engaged visitor" signal independent of any click.
 *
 * Lands the current pathname under `landing` so we can split funnels:
 *   landing="dev"      → /[lang]/for-developers
 *   landing="consumer" → /[lang]
 *   landing="other"    → everything else (marketplace, pricing, etc.)
 */
export function CtaTracker() {
  useEffect(() => {
    const inferLanding = (path: string): "dev" | "consumer" | "other" => {
      if (/^\/(?:es|en)\/for-developers/.test(path)) return "dev";
      if (/^\/(?:es|en)\/?$/.test(path)) return "consumer";
      return "other";
    };

    const onClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const cta = target.closest<HTMLElement>("[data-cta]");
      if (!cta) return;
      const name = cta.getAttribute("data-cta") || "unknown";
      track("cta_click", {
        cta: name,
        landing: inferLanding(window.location.pathname),
        path: window.location.pathname,
      });
    };

    let fired75 = false;
    const onScroll = () => {
      if (fired75) return;
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight;
      if (total > 0 && scrolled / total >= 0.75) {
        fired75 = true;
        track("scroll_75", {
          landing: inferLanding(window.location.pathname),
          path: window.location.pathname,
        });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
