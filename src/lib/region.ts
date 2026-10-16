/**
 * Región del visitante para el consentimiento de cookies.
 *
 * Decisión de JM (2026-10-16): el banner estricto y el bloqueo previo de la
 * analítica se aplican SOLO a visitantes de Europa. Fuera de Europa el sitio se
 * comporta como antes (sin banner; analítica, Sentry y `tsync_landing` activos).
 *
 * "Europa" = UE-27 + EEE (IS, LI, NO) + Reino Unido (GB) + Suiza (CH).
 *
 * El país lo da Vercel en el borde (cabecera `x-vercel-ip-country`). El
 * middleware lo traduce a la cookie `ts_region` (`eu` | `row`), que leen el
 * navegador (`consent.ts`) y la home estática (`public/consent.js`).
 *
 * FAIL-SAFE: ante cualquier duda (cabecera ausente, vacía, "XX", valor raro,
 * cookie ausente o manipulada) la región es `eu`, es decir, el comportamiento
 * estricto. Solo el valor exacto `row` relaja.
 */

export type Region = "eu" | "row";

export const REGION_COOKIE = "ts_region";
export const COUNTRY_HEADER = "x-vercel-ip-country";

/** UE-27. */
export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;
/** EEE no UE, Reino Unido y Suiza. */
export const OTHER_EUROPE_COUNTRIES = ["IS", "LI", "NO", "GB", "CH"] as const;

export const EUROPE_COUNTRIES: ReadonlySet<string> = new Set<string>([
  ...EU_COUNTRIES,
  ...OTHER_EUROPE_COUNTRIES,
]);

/** `true` solo para un código ISO-3166 alfa-2 de la lista (insensible a mayúsculas). */
export function isEuropeCountry(country: string | null | undefined): boolean {
  if (typeof country !== "string") return false;
  return EUROPE_COUNTRIES.has(country.trim().toUpperCase());
}

/**
 * Región a partir del país. Solo un código ISO alfa-2 válido y que NO está en
 * la lista de Europa da `row`; cualquier otra cosa (vacío, ausente, "XX", "T1",
 * basura) da `eu`.
 */
export function regionForCountry(country: string | null | undefined): Region {
  if (typeof country !== "string") return "eu";
  const c = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "eu";
  // Vercel usa "XX" cuando no puede geolocalizar; T1 = Tor, etc. (no son alfa-2 reales).
  if (c === "XX" || c === "T1") return "eu";
  return isEuropeCountry(c) ? "eu" : "row";
}

/** Región a partir de unas cabeceras (con fail-safe si falta o falla la lectura). */
export function regionFromHeaders(headers: { get(name: string): string | null }): Region {
  try {
    return regionForCountry(headers.get(COUNTRY_HEADER));
  } catch {
    return "eu";
  }
}

/** Lee `ts_region` de una cadena tipo `document.cookie`. Solo `row` exacto relaja. */
export function regionFromCookieString(cookie: string | null | undefined): Region {
  if (!cookie) return "eu";
  const m = /(?:^|;\s*)ts_region=([^;]*)/.exec(cookie);
  return m && m[1] === "row" ? "row" : "eu";
}

/** Región del navegador actual (`eu` en servidor, sin cookie o si falla). */
export function browserRegion(): Region {
  try {
    if (typeof document === "undefined") return "eu";
    return regionFromCookieString(document.cookie);
  } catch {
    return "eu";
  }
}
