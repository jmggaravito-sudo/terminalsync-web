/**
 * Inventario REAL de cookies y almacenamiento del sitio (auditoría 2026-10-16).
 *
 * Alimenta la página `/[lang]/legal/cookies`. Cada fila sale del código:
 *   - localStorage / cookies propios: grep de `localStorage`, `document.cookie`
 *     y `cookies.set` en `src/` y en `public/landing-b/`.
 *   - Terceros: `src/app/layout.tsx`, `src/components/*Loader*`,
 *     `instrumentation-client.ts`, `public/landing-b/index.html`.
 * Si se añade un script, una cookie o una clave de almacenamiento al sitio, hay
 * que añadir aquí su fila; `consent.test.ts` vigila el caso de los scripts.
 */
import type { Bilingual } from "./legalEntity";

export type CookieCategory = "necessary" | "analytics" | "affiliates";

export type CookieRow = {
  /** Nombre de la cookie / clave de almacenamiento / destino de la petición. */
  name: string;
  provider: string;
  kind: "cookie" | "localStorage" | "request";
  category: CookieCategory;
  party: "own" | "third";
  purpose: Bilingual;
  duration: Bilingual;
  /** Si hay una duda de clasificación para el abogado (solo borrador). */
  confirm?: Bilingual;
};

export const COOKIE_ROWS: CookieRow[] = [
  // ── Necesarias ─────────────────────────────────────────────────────────
  {
    name: "terminalsync:cookie-consent-v2",
    provider: "TerminalSync",
    kind: "localStorage",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Guarda tu decisión sobre las cookies (versión del aviso, fecha y categorías) para no volver a preguntarte y poder demostrar el consentimiento.",
      en: "Stores your cookie decision (notice version, date and categories) so we do not ask again and can evidence consent.",
    },
    duration: {
      es: "Hasta que la borres o cambie la versión del aviso",
      en: "Until you delete it or the notice version changes",
    },
  },
  {
    name: "terminalsync:cookie-consent-v1",
    provider: "TerminalSync",
    kind: "localStorage",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Valor del banner anterior. Solo se lee para respetar una aceptación antigua de afiliados; nunca activa la analítica.",
      en: "Value from the previous banner. Only read to honour an old affiliates acceptance; it never enables analytics.",
    },
    duration: { es: "Hasta que la borres", en: "Until you delete it" },
  },
  {
    name: "ts_region",
    provider: "TerminalSync",
    kind: "cookie",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Indica si visitas desde Europa («eu») o desde otra región («row») para decidir si te mostramos el aviso de cookies. Se calcula a partir del país de tu conexión en el momento de la visita; no guarda tu IP ni ningún dato personal.",
      en: "Tells us whether you are visiting from Europe (“eu”) or from another region (“row”) so we know whether to show the cookie notice. It is derived from the country of your connection at the time of the visit; it does not store your IP or any personal data.",
    },
    duration: {
      es: "Sesión (se borra al cerrar el navegador)",
      en: "Session (deleted when you close the browser)",
    },
  },
  {
    name: "terminalsync:theme · ts-theme · ts_lang",
    provider: "TerminalSync",
    kind: "localStorage",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Recuerdan el tema (claro u oscuro) y el idioma que tú eliges.",
      en: "Remember the theme (light or dark) and the language you choose.",
    },
    duration: { es: "Hasta que las borres", en: "Until you delete them" },
  },
  {
    name: "sb-<proyecto>-auth-token",
    provider: "Supabase",
    kind: "localStorage",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Mantiene tu sesión iniciada. Solo existe si inicias sesión.",
      en: "Keeps you signed in. It only exists if you sign in.",
    },
    duration: { es: "Mientras dure la sesión", en: "For the length of the session" },
  },
  {
    name: "sync-ai-session-v1",
    provider: "TerminalSync",
    kind: "localStorage",
    category: "necessary",
    party: "own",
    purpose: {
      es: "Identificador aleatorio de la conversación del asistente de soporte del sitio, para que no se pierda al navegar.",
      en: "Random identifier of the site's support assistant conversation, so it is not lost when you navigate.",
    },
    duration: { es: "Hasta que la borres", en: "Until you delete it" },
    confirm: {
      es: "el widget crea este identificador al cargar la página, antes de que abras el chat; el abogado debe decidir si cabe como técnico o si debe crearse solo al abrirlo",
      en: "the widget creates this identifier when the page loads, before you open the chat; the lawyer must decide whether it counts as technical or should only be created on opening",
    },
  },
  // ── Analítica y errores (solo con consentimiento) ──────────────────────
  {
    name: "/_vercel/insights/script.js",
    provider: "Vercel Web Analytics",
    kind: "request",
    category: "analytics",
    party: "third",
    purpose: {
      es: "Mide páginas vistas y clics en los botones principales (eventos «cta_click» y «scroll_75»). No usa cookies según la documentación de Vercel.",
      en: "Measures page views and clicks on the main buttons (“cta_click” and “scroll_75” events). It does not use cookies according to Vercel's documentation.",
    },
    duration: { es: "Sin cookie; sin almacenamiento en tu navegador", en: "No cookie; nothing stored in your browser" },
    confirm: {
      es: "decidir si esta analítica queda exenta de consentimiento; hasta entonces se trata como analítica con consentimiento previo",
      en: "decide whether this analytics is exempt from consent; until then it is treated as analytics requiring prior consent",
    },
  },
  {
    name: "/_vercel/speed-insights/script.js",
    provider: "Vercel Speed Insights",
    kind: "request",
    category: "analytics",
    party: "third",
    purpose: {
      es: "Mide el rendimiento de carga del sitio (métricas agregadas).",
      en: "Measures site loading performance (aggregated metrics).",
    },
    duration: { es: "Sin cookie; sin almacenamiento en tu navegador", en: "No cookie; nothing stored in your browser" },
    confirm: {
      es: "misma duda de exención que Web Analytics",
      en: "same exemption question as Web Analytics",
    },
  },
  {
    name: "Sentry (navegador)",
    provider: "Sentry",
    kind: "request",
    category: "analytics",
    party: "third",
    purpose: {
      es: "Informa de errores de JavaScript del sitio. Sin grabación de sesión. Se inicializa solo tras tu consentimiento.",
      en: "Reports JavaScript errors on the site. No session replay. Initialised only after your consent.",
    },
    duration: { es: "Sin cookie propia", en: "No cookie of its own" },
  },
  {
    name: "tsync_landing",
    provider: "TerminalSync",
    kind: "cookie",
    category: "analytics",
    party: "own",
    purpose: {
      es: "Recuerda si llegaste por la página para particulares o la de desarrolladores, para elegir el correo de bienvenida adecuado si creas una cuenta.",
      en: "Remembers whether you arrived via the consumer or the developer page, to choose the right welcome email if you create an account.",
    },
    duration: { es: "30 días", en: "30 days" },
    confirm: {
      es: "se ha tratado como analítica (medición de origen) y solo se crea con consentimiento; el abogado puede reclasificarla",
      en: "treated as analytics (origin measurement) and only set with consent; the lawyer may reclassify it",
    },
  },
  // ── Afiliados (solo con consentimiento) ────────────────────────────────
  {
    name: "rewardful.referral · r.wdfl.co/rw.js",
    provider: "Rewardful",
    kind: "cookie",
    category: "affiliates",
    party: "third",
    purpose: {
      es: "Registra qué afiliado te recomendó TerminalSync para atribuirle la comisión si contratas.",
      en: "Records which affiliate referred you to TerminalSync so the commission can be attributed if you subscribe.",
    },
    duration: { es: "60 días", en: "60 days" },
    confirm: {
      es: "nombre exacto de la cookie según la documentación de Rewardful (no verificado en este repositorio)",
      en: "exact cookie name per Rewardful documentation (not verified in this repository)",
    },
  },
];

/**
 * Peticiones a terceros que ocurren al abrir el sitio SIN consentimiento previo
 * y sin cookies. Se declaran por transparencia; el handoff W2 pide eliminarlas
 * autoalojando los recursos.
 */
export const PRELOAD_THIRD_PARTY: Array<{
  host: string;
  provider: string;
  purpose: Bilingual;
  where: Bilingual;
}> = [
  {
    host: "fonts.googleapis.com · fonts.gstatic.com",
    provider: "Google Fonts",
    purpose: { es: "Tipografías Geist y Geist Mono.", en: "Geist and Geist Mono typefaces." },
    where: { es: "Todas las páginas", en: "All pages" },
  },
  {
    host: "unpkg.com",
    provider: "unpkg",
    purpose: { es: "Librería de iconos Lucide.", en: "Lucide icon library." },
    where: { es: "Página de inicio (/es y /en)", en: "Home page (/es and /en)" },
  },
  {
    host: "apis.google.com",
    provider: "Google",
    purpose: {
      es: "Selector de archivos de Google Drive, solo cuando la app de escritorio lo abre.",
      en: "Google Drive file picker, only when the desktop app opens it.",
    },
    where: { es: "Solo en /picker", en: "Only on /picker" },
  },
];
