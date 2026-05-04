"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Dict } from "@/content";

const STORAGE_KEY = "terminalsync:cookie-consent-v1";
type Consent = "accepted" | "necessary";

const COPY = {
  es: {
    title: "🍪 Privacidad primero",
    body: "Usamos cookies estrictamente necesarias para autenticación y preferencias. Si llegaste por un link de afiliado, una cookie de Rewardful registra el referrer durante 60 días. Sin cookies de publicidad ni tracking cross-site.",
    accept: "Aceptar todas",
    necessary: "Solo necesarias",
    learnMore: "Leer la política",
    learnMoreHref: "/es/legal/privacy",
  },
  en: {
    title: "🍪 Privacy first",
    body: "We use cookies strictly necessary for authentication and preferences. If you arrived via an affiliate link, a Rewardful cookie records the referrer for 60 days. No ad cookies, no cross-site tracking.",
    accept: "Accept all",
    necessary: "Necessary only",
    learnMore: "Read the policy",
    learnMoreHref: "/en/legal/privacy",
  },
};

/**
 * Minimal self-hosted cookie banner. No third-party CMP — keeps the
 * privacy story consistent (we say "your data is yours" → we don't
 * outsource consent to a vendor that fingerprints visitors).
 *
 * The only non-essential cookie this site sets is Rewardful's affiliate
 * referrer. If the user picks "Necessary only", we set a flag that
 * Rewardful's loader can read to suppress the cookie on subsequent
 * navigations. The Rewardful script in app/layout.tsx already gates on
 * NEXT_PUBLIC_REWARDFUL_API_KEY; we add a runtime gate via this consent
 * flag so the script doesn't load when consent is denied.
 *
 * The banner shows on first visit and stays hidden after a choice. It's
 * also reachable from the privacy policy footer if the user wants to
 * change their mind (todo: link).
 */
export function CookieBanner({ dict }: { dict: Dict }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // Private mode — show banner; choice just won't persist.
      setVisible(true);
    }
  }, []);

  function handleChoice(consent: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      /* private mode */
    }
    setVisible(false);
    // If the user accepted, dispatch a custom event so any deferred
    // analytics or affiliate scripts can hot-init without a reload.
    if (typeof window !== "undefined" && consent === "accepted") {
      window.dispatchEvent(new CustomEvent("ts:cookies:accepted"));
    }
  }

  if (!mounted || !visible) return null;

  const t = COPY[dict.locale];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-40 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] shadow-2xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2
            id="cookie-banner-title"
            className="text-[14px] font-semibold text-[var(--color-fg-strong)] mb-1.5"
          >
            {t.title}
          </h2>
          <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {t.body}{" "}
            <a
              href={t.learnMoreHref}
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] underline underline-offset-2"
            >
              {t.learnMore}
            </a>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleChoice("necessary")}
          aria-label={dict.locale === "es" ? "Cerrar" : "Close"}
          className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-md text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-panel-2)]"
        >
          <X size={16} strokeWidth={2.4} />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleChoice("accepted")}
          className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold transition-colors"
        >
          {t.accept}
        </button>
        <button
          type="button"
          onClick={() => handleChoice("necessary")}
          className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-[var(--color-panel-2)] hover:bg-[var(--color-border)] text-[var(--color-fg)] text-[12.5px] font-semibold transition-colors"
        >
          {t.necessary}
        </button>
      </div>
    </div>
  );
}
