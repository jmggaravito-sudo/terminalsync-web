"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Dict } from "@/content";

/**
 * Floating download CTA, mobile-only. Appears after the user scrolls
 * past the hero so the desktop nav's primary download button isn't on
 * screen anymore. Hidden on md+ because the sticky <Nav> already keeps
 * a download button visible there.
 *
 * Sits above the cookie banner (which is bottom-right) by anchoring to
 * bottom-left. Auto-hides if the cookie banner isn't dismissed yet so
 * we don't stack two floating UIs.
 */
export function StickyDownloadCTA({ dict }: { dict: Dict }) {
  const [show, setShow] = useState(false);
  const [cookieBannerOpen, setCookieBannerOpen] = useState(false);

  useEffect(() => {
    // Show after scrolling past 1 viewport — keeps the hero pristine on
    // first paint, surfaces persistent CTA the moment the user is
    // engaging with the body.
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Cookie banner check — if it's still open, hide ourselves so we
    // don't crowd the bottom of the screen.
    const checkCookie = () => {
      try {
        const stored = localStorage.getItem("terminalsync:cookie-consent-v1");
        setCookieBannerOpen(!stored);
      } catch {
        setCookieBannerOpen(false);
      }
    };
    checkCookie();
    const interval = setInterval(checkCookie, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(interval);
    };
  }, []);

  if (!show || cookieBannerOpen) return null;

  const label = dict.locale === "es" ? "Descargar app" : "Download app";

  return (
    <a
      href="/api/download"
      data-cta="sticky-mobile"
      className="md:hidden fixed bottom-4 left-4 right-4 z-30 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold py-3 shadow-2xl transition-all"
    >
      <Download size={15} strokeWidth={2.4} />
      {label}
    </a>
  );
}
