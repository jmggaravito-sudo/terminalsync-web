/**
 * Map a Vercel-provided country code (`x-vercel-ip-country`) to a local
 * currency hint for display next to USD prices.
 *
 * SCOPE: this is a DISPLAY HINT only. Stripe still charges in USD; the
 * local figure is a "≈" approximation so the visitor can mentally
 * benchmark cost without doing FX math. Once JM ships Stripe pricing
 * tiers per currency we can swap to real multi-currency checkout.
 *
 * Rates updated 2026-05-04. Re-check quarterly — small drift is fine
 * (we already disclaim "≈"), big drift hurts trust.
 */
export interface CurrencyHint {
  /** ISO 4217 code, e.g. "COP" */
  code: string;
  /** Symbol to render before the number, e.g. "$" or "€" */
  symbol: string;
  /** USD → local multiplier */
  rate: number;
  /** Locale for Intl.NumberFormat, e.g. "es-CO" */
  locale: string;
}

const HINTS: Record<string, CurrencyHint> = {
  // Colombia (JM's home market — leading non-USD)
  CO: { code: "COP", symbol: "$", rate: 4150, locale: "es-CO" },
  // México
  MX: { code: "MXN", symbol: "$", rate: 18, locale: "es-MX" },
  // Argentina (volatile FX — keep updated)
  AR: { code: "ARS", symbol: "$", rate: 1180, locale: "es-AR" },
  // Brazil
  BR: { code: "BRL", symbol: "R$", rate: 5.6, locale: "pt-BR" },
  // Chile
  CL: { code: "CLP", symbol: "$", rate: 950, locale: "es-CL" },
  // Peru
  PE: { code: "PEN", symbol: "S/", rate: 3.7, locale: "es-PE" },
};

// Eurozone — covered by a single hint, all map to EUR.
const EUROZONE = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

const EUR_HINT: CurrencyHint = {
  code: "EUR",
  symbol: "€",
  rate: 0.92,
  locale: "de-DE",
};

/** Returns a CurrencyHint or null if the visitor should see USD only. */
export function currencyForCountry(country: string | null | undefined): CurrencyHint | null {
  if (!country) return null;
  const upper = country.toUpperCase();
  if (HINTS[upper]) return HINTS[upper];
  if (EUROZONE.has(upper)) return EUR_HINT;
  return null;
}

/** Format a USD amount as the local approximation. Rounds to a clean
 *  number — no decimals. */
export function formatLocal(usd: number, hint: CurrencyHint): string {
  const local = usd * hint.rate;
  // For high-rate currencies (COP, ARS, CLP) round to nearest 1000.
  // For mid-rate (MXN, BRL) round to nearest 10. For EUR keep one decimal
  // step.
  let rounded: number;
  if (hint.rate > 100) rounded = Math.round(local / 1000) * 1000;
  else if (hint.rate > 5) rounded = Math.round(local / 10) * 10;
  else rounded = Math.round(local);

  return new Intl.NumberFormat(hint.locale, {
    style: "currency",
    currency: hint.code,
    maximumFractionDigits: 0,
  }).format(rounded);
}
