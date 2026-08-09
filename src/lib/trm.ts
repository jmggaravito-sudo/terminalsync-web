/**
 * TRM — Tasa Representativa del Mercado.
 *
 * The legal COP/USD rate in Colombia, published by the Superintendencia
 * Financiera and read here from the government's open-data service. It is the
 * rate a Colombian accountant expects to see, which is why it is used instead
 * of any market quote.
 *
 * This replaces a hardcoded 4,100 that had drifted badly: on 2026-08-05 the
 * real TRM was 3,204.51, so a Colombian was paying about 28% more than the
 * dollar price for the same package.
 *
 * ## Vigencia is a range, not a day
 *
 * Each published TRM carries `vigenciadesde`/`vigenciahasta`, and one row can
 * cover several days — the rate published on Friday Aug 1 was valid through
 * Sunday Aug 3. Taking "the newest row" without checking the range can pick a
 * rate that does not apply yet, so the lookup asks for the row whose range
 * contains the day being priced.
 */

const TRM_ENDPOINT = "https://www.datos.gov.co/resource/32sa-8pi3.json";

/**
 * Last rate known good at the time of writing (2026-08-05). Only used when the
 * service cannot be reached and nothing is cached yet — never silently: the
 * caller learns which source was used.
 */
export const TRM_FALLBACK = 3_204.51;
export const TRM_FALLBACK_DATE = "2026-08-05";

/** A published rate outside this band is a parsing or feed accident, not news. */
const TRM_SANITY_MIN = 1_000;
const TRM_SANITY_MAX = 20_000;

/** A real TRM does not jump this much between publications. */
const TRM_MAX_DAILY_MOVE = 0.1;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export type TrmSource = "live" | "cache" | "fallback";

export interface TrmRate {
  value: number;
  /** The day the rate applies to, `YYYY-MM-DD`. */
  date: string;
  source: TrmSource;
}

interface TrmRow {
  valor?: string;
  vigenciadesde?: string;
  vigenciahasta?: string;
}

let cached: { rate: TrmRate; at: number } | null = null;

/** Exposed for tests; production callers never need it. */
export function __resetTrmCache() {
  cached = null;
}

export function isPlausibleTrm(value: number, previous?: number): boolean {
  if (!Number.isFinite(value) || value <= 0) return false;
  if (value < TRM_SANITY_MIN || value > TRM_SANITY_MAX) return false;
  if (previous && previous > 0) {
    const move = Math.abs(value - previous) / previous;
    if (move > TRM_MAX_DAILY_MOVE) return false;
  }
  return true;
}

/**
 * Pick the row whose vigencia range contains `day`, falling back to the most
 * recent row that already started. Rows are expected newest-first.
 */
export function pickRowForDay(rows: TrmRow[], day: string): TrmRow | null {
  const started = rows.filter((r) => (r.vigenciadesde ?? "").slice(0, 10) <= day);
  const covering = started.find(
    (r) => (r.vigenciahasta ?? r.vigenciadesde ?? "").slice(0, 10) >= day,
  );
  return covering ?? started[0] ?? null;
}

export function parseTrmRows(rows: TrmRow[], day: string, previous?: number): TrmRate | null {
  const row = pickRowForDay(rows, day);
  if (!row?.valor) return null;
  const value = Number(row.valor);
  if (!isPlausibleTrm(value, previous)) return null;
  return {
    value,
    date: (row.vigenciadesde ?? day).slice(0, 10),
    source: "live",
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Current TRM. Never throws: a failed lookup degrades to the cached value, then
 * to the last known good one, and says which it used.
 */
export async function getTrm(now = today()): Promise<TrmRate> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS && cached.rate.date <= now) {
    return { ...cached.rate, source: "cache" };
  }

  try {
    const url = `${TRM_ENDPOINT}?$order=vigenciadesde%20DESC&$limit=10`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const rows = (await res.json()) as TrmRow[];
      const parsed = parseTrmRows(rows, now, cached?.rate.value);
      if (parsed) {
        cached = { rate: parsed, at: Date.now() };
        return parsed;
      }
    }
  } catch {
    // Falls through to the degraded paths below. A pricing call must not fail
    // because a government service is slow.
  }

  if (cached) return { ...cached.rate, source: "cache" };
  return { value: TRM_FALLBACK, date: TRM_FALLBACK_DATE, source: "fallback" };
}
