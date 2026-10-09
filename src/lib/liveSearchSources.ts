/**
 * Fuentes de la Búsqueda en vivo que la landing muestra como una fila propia
 * ("La IA de TS busca en vivo en…").
 *
 * **No son integraciones.** Las integraciones (`IntegrationsMarquee`,
 * `public/connectors/`) son cuentas que el cliente conecta; estas fuentes son
 * información pública que la IA de TS consulta sola, gratis e incluida en el
 * plan. Por eso viven en su propia lista, con sus logos en `public/sources/`,
 * y no se mezclan con el catálogo de conectores.
 *
 * El proveedor de búsqueda que hay detrás no se nombra en el sitio.
 *
 * Una sola lista alimenta las dos portadas:
 * - `IntegrationsMarquee.tsx` (portada React, la que vuelve si se apaga
 *   `LANDING_B`) la lee directo.
 * - `public/landing-b/index.html` (la portada activa, HTML estático) tiene la
 *   misma fila escrita a mano; `liveSearchSources.test.ts` falla si se
 *   desincroniza de esta lista. El HTML estático no puede leer env vars, así
 *   que pregunta el interruptor a `/api/live-search-sources`.
 *
 * **Logos: decisión de JM del 2026-10-09.** Todas las fuentes van con su
 * logo y su nombre. La revisión de pautas del 2026-10-08 encontró que casi
 * todas estas marcas piden permiso o licencia para usar su logo (solo
 * Perplexity no); JM decidió usarlos igual, asumiendo ese riesgo de marca, y
 * sacar a Walmart de la fila. La nota "no implica afiliación" va siempre.
 * Detalle, links por marca y origen de cada SVG en `docs/live-search-sources.md`.
 */

/**
 * Interruptor del lote 3 de la Búsqueda en vivo (fuentes que todavía NO están
 * en producción en la app).
 *
 * Apagado por defecto: la landing solo muestra lo que la app ya consulta hoy.
 * Cómo se prende: setear `NEXT_PUBLIC_LIVE_SEARCH_LOTE3=1` (valor exacto "1",
 * cualquier otra cosa es apagado) en las env vars del proyecto en Vercel y
 * **redeployar** — las `NEXT_PUBLIC_*` se inyectan en el build, no en runtime.
 * Mismo patrón que `NEXT_PUBLIC_MERCADOPAGO_ENABLED` en `useGeoCurrency.ts`.
 */
export const liveSearchLote3Enabled =
  process.env.NEXT_PUBLIC_LIVE_SEARCH_LOTE3 === "1";

/** `live` = en producción en la app hoy (lotes 1 y 2). `lote3` = en camino. */
export type LiveSearchBatch = "live" | "lote3";

export interface LiveSearchSource {
  /** Nombre de la marca/fuente en inglés. Es el texto y el `alt` del logo. */
  name: string;
  /** Nombre en español, solo si cambia (ej. "Biblioteca de anuncios de Meta"). */
  es?: string;
  /**
   * Archivo en `public/sources/<logo>.svg`. `null` = solo el nombre (hoy
   * ninguna; queda para una fuente nueva que todavía no tenga logo).
   */
  logo: string | null;
  /** Logo negro/oscuro: en tema oscuro necesita fondo claro para verse. */
  darkLogo?: boolean;
  batch: LiveSearchBatch;
}

/**
 * Orden = orden en pantalla. Una marca aparece una sola vez aunque cubra
 * varias fuentes (Google cubre web, Noticias, Shopping, Trends, anuncios de
 * Google, Google AI y, en el lote 3, Google Jobs; Google Maps cubre las
 * reseñas de Google; YouTube cubre subtítulos y, en el lote 3, búsqueda de
 * videos). Walmart no va: decisión de JM del 2026-10-09.
 */
export const LIVE_SEARCH_SOURCES: readonly LiveSearchSource[] = [
  // ── En producción (lotes 1 y 2) ──
  { name: "Google", logo: "google", batch: "live" },
  { name: "Google Maps", logo: "google-maps", batch: "live" },
  { name: "YouTube", logo: "youtube", batch: "live" },
  {
    name: "Meta Ad Library",
    es: "Biblioteca de anuncios de Meta",
    logo: "meta",
    batch: "live",
  },
  { name: "ChatGPT", logo: "chatgpt", darkLogo: true, batch: "live" },
  { name: "Perplexity", logo: "perplexity", batch: "live" },
  { name: "Yelp", logo: "yelp", batch: "live" },
  // ── Lote 3: detrás de NEXT_PUBLIC_LIVE_SEARCH_LOTE3 ──
  { name: "TikTok", logo: "tiktok", darkLogo: true, batch: "lote3" },
  { name: "Instagram", logo: "instagram", batch: "lote3" },
  { name: "Facebook", logo: "facebook", batch: "lote3" },
  { name: "Tripadvisor", logo: "tripadvisor", batch: "lote3" },
  { name: "Amazon", logo: "amazon", batch: "lote3" },
  { name: "eBay", logo: "ebay", batch: "lote3" },
  { name: "Airbnb", logo: "airbnb", batch: "lote3" },
];

/** Texto visible de la fuente en el idioma pedido. */
export function liveSearchSourceLabel(
  source: LiveSearchSource,
  lang: "es" | "en",
): string {
  return lang === "es" && source.es ? source.es : source.name;
}

/** Las fuentes que se muestran con el interruptor del lote 3 en `lote3`. */
export function liveSearchSourcesFor(
  lote3: boolean,
): readonly LiveSearchSource[] {
  return LIVE_SEARCH_SOURCES.filter((s) => s.batch === "live" || lote3);
}

/** Las fuentes visibles en este build. */
export const VISIBLE_LIVE_SEARCH_SOURCES = liveSearchSourcesFor(
  liveSearchLote3Enabled,
);
