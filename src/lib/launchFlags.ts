/**
 * Interruptores de lanzamiento del sitio.
 *
 * Existen para poder sacar algo de la vista del visitante **sin borrarlo**:
 * el componente, su copy y sus tests siguen enteros, y volver a mostrarlo es
 * cambiar un `false` por un `true`. Mismo criterio que la app usa para
 * Trabajos Automatizados y para computer use.
 */

/**
 * ¿Ofrecemos la extensión de Chrome en el sitio?
 *
 * **Apagada el 2026-09-23 por decisión de JM** ("hay que apagar la extensión
 * de Chrome mientras terminamos"), junto con el apagado de computer use en la
 * app. Tres razones medidas, no una:
 *
 * 1. **El CTA lleva a una página que no existe.** "Instalar en Chrome" apunta
 *    a una ficha del Chrome Web Store que todavía no está publicada — la app
 *    ya lo sabe y por eso su propio botón manda a esta landing en vez de a la
 *    tienda. O sea que hoy el visitante que hace click en el botón principal
 *    de esa sección termina en un error de Google.
 * 2. **Vende el producto que la v0.3.0 dejó de ser.** La sección promete "las
 *    3 IAs lado a lado" con Claude, Codex y Gemini y con las llaves propias
 *    del cliente. El lanzamiento es TerminalSync como IA única: quien llegue
 *    por esa promesa se instala otra cosa.
 * 3. **Nadie la probó.** Es la misma puerta que computer use, por el
 *    navegador en vez de por el escritorio, y no pasó ningún smoke.
 *
 * Para volver a prenderla hacen falta las tres: la ficha publicada en el
 * Chrome Web Store, la copy reescrita para IA única, y un smoke que la
 * recorra. No alcanza con una.
 *
 * Qué corta: la sección de la portada y el enlace del pie. La página de
 * privacidad de la extensión (`/[lang]/legal/extension-privacy`) queda en pie
 * a propósito — es un documento legal, sigue siendo cierto, y la tienda la
 * exige el día que se publique la ficha.
 */
export const CHROME_EXTENSION_PUBLIC = false;

/**
 * ¿La portada usa el Landing B (IA única)?
 *
 * **Apagado mientras se construye.** Mismo criterio que CHROME_EXTENSION_PUBLIC:
 * apagar es cambiar a `false`, la portada vieja sigue entera y vuelve sola.
 *
 * Para prenderlo hacen falta tres cosas juntas:
 * 1. La imagen del hero en `public/landing-b/app-home-cover-v3.png`.
 * 2. Los 8 demos HTML en `public/demos/`.
 * 3. Un smoke que recorra `/es`, `/en`, `/es/login`, `/es/admin`,
 *    `/es/connectors` y `/es/checkout` con el interruptor en `true`,
 *    confirmando que el Nav sigue apareciendo en todas las páginas internas.
 *
 * Qué corta: la portada `/es` y `/en`. Todo lo demás — login, admin,
 * checkout, conectores, legales — queda intacto con su Nav.
 */
export const LANDING_B = true;

/**
 * ¿El sitio menciona que se trabaja con varias IAs (Claude, Codex, Gemini)?
 *
 * **Apagado el 2026-10-07 por decisión de JM** ("saca lo de las 3 IAs
 * también… en esta primera etapa no quiero mencionar nada de eso"). Mismo
 * criterio que `CHROME_EXTENSION_PUBLIC`: apagar es cambiar a `false`, las
 * páginas y su copy siguen enteras, y volver a mostrarlas es un `true`.
 *
 * El motivo de fondo es que hoy la promesa no es cierta: la app **no permite**
 * conectar una cuenta propia de Claude, Codex o Gemini. El modo avanzado
 * arranca apagado en la build de cliente y no hay forma de prenderlo — la
 * función que lo prende no la llama nadie y la pantalla de opciones avanzadas
 * no está construida. Quien llegue por "las 3 IAs" se instala otra cosa.
 *
 * Qué corta: las páginas cuyo TEMA es trabajar con varias IAs —
 * `/[lang]/ai-terminal`, `/[lang]/casos-de-uso` y las tres guías
 * `sync-claude-code-between-macs`, `sync-codex-between-macs` y
 * `sync-gemini-cli-between-macs` — y sus entradas en el sitemap.
 *
 * Qué NO corta, a propósito:
 *
 * - Las páginas `/[lang]/vs/<herramienta>`. Son comparativas con
 *   competidores; nombrar a Cursor, Copilot o Gemini ahí es normal y no es
 *   ofrecer traer tu cuenta. Las frases que SÍ lo ofrecían ("corre TU Claude,
 *   Codex o Gemini", "las 3 IAs en una, con tu cuenta") se reescribieron en
 *   el mismo cambio, así que esas páginas ya no prometen nada falso.
 * - La página de privacidad de la extensión y los legales.
 *
 * 🚨 Apagar esto saca de circulación URLs que ya están indexadas. Es el costo
 * aceptado de no prometer lo que el producto no hace; volver a prenderlo las
 * devuelve, pero el ranking tarda en recuperarse.
 */
export const MULTI_AI_PUBLIC = false;
