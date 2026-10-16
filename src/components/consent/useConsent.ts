"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  NO_CONSENT,
  browserStorage,
  effectiveConsent,
  type ConsentCategories,
} from "@/lib/consent";

/**
 * Categorías de consentimiento vigentes.
 *
 * En servidor y en el primer render del cliente devuelve `NO_CONSENT`: nada
 * no esencial se monta hasta que, ya en el navegador, se lee una decisión
 * válida. Se actualiza al instante cuando el banner emite `CONSENT_EVENT`.
 */
export function useConsent(): ConsentCategories {
  const [state, setState] = useState<ConsentCategories>(NO_CONSENT);

  useEffect(() => {
    setState(effectiveConsent(browserStorage()));
    const onChange = (ev: Event) => {
      const detail = (ev as CustomEvent<ConsentCategories>).detail;
      setState(detail ?? effectiveConsent(browserStorage()));
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return state;
}
