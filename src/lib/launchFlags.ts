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
