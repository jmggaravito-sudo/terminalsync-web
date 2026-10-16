/**
 * Mercados (países) donde una integración es realmente útil / está disponible.
 *
 * Cada ficha de `content/connectors/{en,es}/<slug>.md` declara `markets` en el
 * frontmatter: un arreglo de códigos ISO 3166-1 alfa-2 (mayúsculas) o
 * `["GLOBAL"]` para herramientas que funcionan igual en todo el mundo.
 * El valor es el MISMO en en y es.
 *
 * Regla de evidencia: `GLOBAL` solo si el producto es de verdad mundial. Si la
 * disponibilidad por país no está clara, se listan únicamente los países que se
 * pueden justificar con la ficha o la documentación pública del proveedor.
 *
 * Mercados de TerminalSync: Estados Unidos y Latinoamérica. Los demás códigos
 * (CA, GB, AU…) existen solo para herramientas con disponibilidad documentada
 * ahí (p. ej. Xero, Square) y no cambian el foco comercial.
 */

export const GLOBAL_MARKET = "GLOBAL" as const;

export interface MarketInfo {
  es: string;
  en: string;
  /** Agrupación para ordenar el filtro del admin. */
  region: "global" | "us" | "latam" | "other";
}

export const MARKETS = {
  GLOBAL: { es: "Global", en: "Global", region: "global" },
  US: { es: "Estados Unidos", en: "United States", region: "us" },
  MX: { es: "México", en: "Mexico", region: "latam" },
  CO: { es: "Colombia", en: "Colombia", region: "latam" },
  AR: { es: "Argentina", en: "Argentina", region: "latam" },
  CL: { es: "Chile", en: "Chile", region: "latam" },
  PE: { es: "Perú", en: "Peru", region: "latam" },
  EC: { es: "Ecuador", en: "Ecuador", region: "latam" },
  DO: { es: "República Dominicana", en: "Dominican Republic", region: "latam" },
  GT: { es: "Guatemala", en: "Guatemala", region: "latam" },
  CR: { es: "Costa Rica", en: "Costa Rica", region: "latam" },
  PA: { es: "Panamá", en: "Panama", region: "latam" },
  UY: { es: "Uruguay", en: "Uruguay", region: "latam" },
  PY: { es: "Paraguay", en: "Paraguay", region: "latam" },
  BO: { es: "Bolivia", en: "Bolivia", region: "latam" },
  VE: { es: "Venezuela", en: "Venezuela", region: "latam" },
  SV: { es: "El Salvador", en: "El Salvador", region: "latam" },
  HN: { es: "Honduras", en: "Honduras", region: "latam" },
  NI: { es: "Nicaragua", en: "Nicaragua", region: "latam" },
  BR: { es: "Brasil", en: "Brazil", region: "latam" },
  PR: { es: "Puerto Rico", en: "Puerto Rico", region: "latam" },
  CA: { es: "Canadá", en: "Canada", region: "other" },
  GB: { es: "Reino Unido", en: "United Kingdom", region: "other" },
  ES: { es: "España", en: "Spain", region: "other" },
  FR: { es: "Francia", en: "France", region: "other" },
  IE: { es: "Irlanda", en: "Ireland", region: "other" },
  JP: { es: "Japón", en: "Japan", region: "other" },
  AU: { es: "Australia", en: "Australia", region: "other" },
  NZ: { es: "Nueva Zelanda", en: "New Zealand", region: "other" },
} as const satisfies Record<string, MarketInfo>;

export type MarketCode = keyof typeof MARKETS;

export const MARKET_CODES = Object.keys(MARKETS) as MarketCode[];

export function isMarketCode(value: unknown): value is MarketCode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(MARKETS, value);
}

export function marketLabel(code: MarketCode, lang: string): string {
  return lang === "en" ? MARKETS[code].en : MARKETS[code].es;
}

/**
 * Valida el valor crudo del frontmatter. Devuelve la lista normalizada
 * (sin duplicados, orden de aparición) o lanza si hay un código desconocido,
 * vacío, o si mezcla GLOBAL con países.
 */
export function parseMarkets(raw: unknown, where = "markets"): MarketCode[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(`${where}: debe ser un arreglo no vacío de códigos ISO o ["GLOBAL"]`);
  }
  const out: MarketCode[] = [];
  for (const item of raw) {
    if (!isMarketCode(item)) {
      throw new Error(`${where}: código de mercado desconocido ${JSON.stringify(item)}`);
    }
    if (!out.includes(item)) out.push(item);
  }
  if (out.includes(GLOBAL_MARKET) && out.length > 1) {
    throw new Error(`${where}: GLOBAL no se combina con países`);
  }
  return out;
}
