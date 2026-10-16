"use client";

import { useEffect } from "react";
import {
  CONSENT_EVENT,
  affiliatesAllowed,
  browserStorage,
  effectiveConsent,
  type ConsentCategories,
} from "@/lib/consent";

/**
 * Carga el rastreador de afiliados de Rewardful SOLO si la persona ha aceptado
 * la categoría "Afiliados" del gestor de cookies. Sin consentimiento (o si
 * rechaza), `rw.js` no se descarga y no se crea ninguna cookie.
 *
 * Secuencia:
 *  1. Se inyecta siempre la cola en línea: solo define `window.rewardful` como
 *     una función vacía. Sin cookies, sin peticiones.
 *  2. Si al montar ya hay consentimiento de afiliados -> se inyecta `rw.js`.
 *  3. Si no, se espera a `CONSENT_EVENT` y se inyecta si la decisión lo incluye.
 *
 * Formato de consentimiento y migración del valor antiguo: `src/lib/consent.ts`
 * (un "accepted" del banner anterior cuenta solo como afiliados).
 *
 * La clave de API va en NEXT_PUBLIC_REWARDFUL_API_KEY. Sin clave, no hace nada.
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

    if (affiliatesAllowed(effectiveConsent(browserStorage()))) {
      injectMainScript();
      return;
    }

    // Esperar a que la persona acepte más tarde en la sesión.
    const onChange = (ev: Event) => {
      const detail = (ev as CustomEvent<ConsentCategories>).detail;
      if (affiliatesAllowed(detail)) injectMainScript();
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}
