/**
 * Consentimiento de cookies y almacenamiento: lógica pura, sin React ni DOM.
 *
 * Una sola fuente de verdad para tres consumidores:
 *   - `ConsentGate` / `CookieBanner` (React, todo el sitio salvo la home estática).
 *   - `public/consent.js` (la home estática `/landing-b/index.html`, que no pasa
 *     por React). Ese archivo repite CONSENT_KEY, CONSENT_VERSION y la forma del
 *     registro; `consent.test.ts` comprueba que no se desincronicen.
 *   - `instrumentation-client.ts` (Sentry del navegador).
 *
 * Regla: sin un registro válido de la versión vigente, TODAS las categorías no
 * necesarias están apagadas. Rechazar es el estado por defecto.
 */

import { browserRegion, type Region } from "./region";

export const CONSENT_KEY = "terminalsync:cookie-consent-v2";
/** Clave del banner anterior (valores "accepted" | "necessary"). */
export const LEGACY_CONSENT_KEY = "terminalsync:cookie-consent-v1";
/**
 * Versión del texto del banner y de las categorías. Subirla vuelve a pedir la
 * decisión a todo el mundo (BORRADOR: el texto lo valida el abogado).
 */
export const CONSENT_VERSION = "2026-10-16";

/** Evento: la decisión cambió. `detail` = ConsentCategories. */
export const CONSENT_EVENT = "ts:consent:changed";
/** Evento: abre el panel "Configurar cookies" (enlace del pie). */
export const OPEN_SETTINGS_EVENT = "ts:consent:open";
/** Evento histórico que RewardfulLoader y otros escuchaban. */
export const LEGACY_ACCEPTED_EVENT = "ts:cookies:accepted";

export type ConsentCategories = {
  /** Analítica y errores: Vercel Web Analytics, Speed Insights, Sentry, atribución propia. */
  analytics: boolean;
  /** Afiliados: Rewardful. */
  affiliates: boolean;
};

export type ConsentRecord = {
  version: string;
  /** ISO 8601 (UTC) del momento de la decisión. */
  date: string;
  categories: ConsentCategories;
};

export const NO_CONSENT: ConsentCategories = Object.freeze({
  analytics: false,
  affiliates: false,
});
export const ALL_CONSENT: ConsentCategories = Object.freeze({
  analytics: true,
  affiliates: true,
});

/** Subconjunto de `Storage` que usamos (permite inyectar un doble en tests). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (!v || typeof v !== "object") return null;
    if (v.version !== CONSENT_VERSION) return null;
    if (typeof v.date !== "string") return null;
    const c = v.categories;
    if (!c || typeof c.analytics !== "boolean" || typeof c.affiliates !== "boolean") {
      return null;
    }
    return {
      version: v.version,
      date: v.date,
      categories: { analytics: c.analytics, affiliates: c.affiliates },
    };
  } catch {
    return null;
  }
}

function safeGet(storage: StorageLike | null | undefined, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

/** Registro vigente (v2, versión actual) o null si hay que volver a preguntar. */
export function readConsentRecord(storage: StorageLike | null | undefined): ConsentRecord | null {
  return parseConsent(safeGet(storage, CONSENT_KEY));
}

/**
 * Categorías efectivas.
 *
 * Migración del valor antiguo: el banner anterior solo informaba de Rewardful,
 * así que un "accepted" antiguo se respeta SOLO para afiliados. Nunca se
 * traduce a analítica: se pidió bajo un texto que decía "sin tracking" y no
 * sirve como consentimiento para medir. El banner vuelve a preguntar (no hay
 * registro v2) y mientras tanto la analítica queda apagada.
 */
export function effectiveConsent(
  storage: StorageLike | null | undefined,
  region: Region = browserRegion(),
): ConsentCategories {
  const rec = readConsentRecord(storage);
  // Una decisión guardada se respeta SIEMPRE, en cualquier región.
  if (rec) return { ...rec.categories };
  // Fuera de Europa, sin decisión: como antes de la web de España (todo activo,
  // sin banner). El valor antiguo v1 no importa aquí.
  if (region === "row") return { ...ALL_CONSENT };
  if (safeGet(storage, LEGACY_CONSENT_KEY) === "accepted") {
    return { analytics: false, affiliates: true };
  }
  return { ...NO_CONSENT };
}

/**
 * ¿Hay que mostrar el banner? En Europa (o ante la duda) sí si no hay registro
 * v2 de la versión vigente. Fuera de Europa nunca: no hay banner.
 */
export function needsDecision(
  storage: StorageLike | null | undefined,
  region: Region = browserRegion(),
): boolean {
  if (region === "row") return false;
  return readConsentRecord(storage) === null;
}

export function buildRecord(categories: ConsentCategories, now: Date = new Date()): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    date: now.toISOString(),
    categories: { analytics: !!categories.analytics, affiliates: !!categories.affiliates },
  };
}

/** Guarda la decisión. Devuelve el registro (aunque el almacenamiento falle). */
export function writeConsent(
  storage: StorageLike | null | undefined,
  categories: ConsentCategories,
  now: Date = new Date(),
): ConsentRecord {
  const rec = buildRecord(categories, now);
  try {
    storage?.setItem(CONSENT_KEY, JSON.stringify(rec));
  } catch {
    /* modo privado: la decisión vale para esta sesión pero no persiste */
  }
  return rec;
}

/** ¿Se puede cargar analítica, medir eventos o inicializar Sentry? */
export function analyticsAllowed(categories: ConsentCategories | null | undefined): boolean {
  return categories?.analytics === true;
}

export function affiliatesAllowed(categories: ConsentCategories | null | undefined): boolean {
  return categories?.affiliates === true;
}

/** Almacenamiento del navegador, o null en servidor / si está bloqueado. */
export function browserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Origen de la visita para la cookie de atribución `tsync_landing`. */
export function landingSourceFor(pathname: string): "dev" | "consumer" | null {
  if (/^\/(?:es|en)\/for-developers(?:\/|$)/.test(pathname)) return "dev";
  if (/^\/(?:es|en)\/?$/.test(pathname)) return "consumer";
  return null;
}
