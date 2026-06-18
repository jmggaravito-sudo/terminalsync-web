# Handoff: Rediseño Landing + Catálogo — TerminalSync

Para implementar en **`jmggaravito-sudo/terminalsync-web`** (Next.js 16 · React 19 · Tailwind v4 · lucide-react · i18n EN/ES).

---

## Overview

Rediseño visual del **landing principal** y de las **páginas de catálogo** (Kits / Conectores / Asistentes / Herramientas CLI, listado + detalle) de TerminalSync. El objetivo del rediseño:

- Reposicionar el mensaje de "herramienta para programadores" → **"equipo digital de IAs para dueños de negocio"**.
- Tema **claro** (papel cálido + acento esmeralda) como default, business-friendly; mocks de producto/terminal quedan oscuros.
- Tres IAs (Claude · Codex · Gemini) y el **cambio en un clic** como héroe del mensaje.
- Catálogo **gratis** (sin precios/Stripe en kits), coherente con el cajón "Integraciones" del app desktop.

## About the Design Files

⚠️ **Los archivos de este bundle son REFERENCIAS de diseño hechas en HTML/CSS** — prototipos que muestran el look & feel y el comportamiento buscado. **No son código de producción para copiar tal cual.**

La tarea es **recrear estos diseños dentro del codebase existente** (`terminalsync-web`) usando sus patrones ya establecidos:
- **Next.js App Router** bajo `src/app/[lang]/…` (mantener el i18n `[lang]`).
- **Tailwind v4** (los tokens de color/tipografía abajo deben ir a `globals.css` / tema de Tailwind como CSS variables — NO usar clases utilitarias con valores mágicos).
- **lucide-react** para iconografía (el HTML usa SVGs inline de Phosphor/feather como placeholder — reemplazar por sus equivalentes de lucide).
- **No romper** la lógica existente: Stripe checkout, Supabase, Resend, los `Explorer.tsx`, `Logo.tsx`, `[slug]/page.tsx`, `opengraph-image.tsx`, ni el middleware de i18n.

Las páginas de catálogo **ya existen** en el repo (`src/app/[lang]/connectors/page.tsx`, `cli-tools/…`, etc.) con datos reales del catálogo/Supabase. **Este rediseño cambia la CAPA VISUAL de esas páginas, no su data-fetching.** Aplicar el nuevo look a los componentes existentes; no reescribir la lógica de datos.

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios y estados finales. Recrear pixel-perfect con las librerías del codebase. Los textos en español son los definitivos de esta iteración (la versión EN se traduce con el i18n existente — ver claves abajo).

---

## Design Tokens

Añadir como CSS variables al tema (light = default). Mocks de producto/terminal usan los valores "dark".

### Colores — Light (default, business)
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#f7f5f1` | Fondo de página (papel cálido) |
| `--bg-2` | `#fffefb` | Fondo elevado |
| `--surface` | `#ffffff` | Tarjetas |
| `--surface-2` | `#faf8f4` | Tarjetas alternas / asides |
| `--line` | `rgba(24,26,31,0.10)` | Bordes sutiles |
| `--line-2` | `rgba(24,26,31,0.16)` | Bordes más marcados |
| `--fg` | `#16181d` | Texto principal |
| `--fg-2` | `#565b64` | Texto secundario |
| `--fg-3` | `#8b909a` | Texto terciario / labels |
| `--accent` | `#0f9d6e` | **Esmeralda de marca** (CTAs, eyebrows, acentos) |
| `--accent-2` | `#0b8a5f` | Esmeralda oscuro (hover/gradientes) |
| `--accent-ink` | `#ffffff` | Texto sobre acento |
| `--accent-soft` | `color-mix(in oklab, var(--accent) 12%, transparent)` | Fondos suaves de chips/badges |
| `--accent-line` | `color-mix(in oklab, var(--accent) 32%, transparent)` | Bordes de chips/badges |
| `--glow` | `rgba(15,157,110,0.14)` | Resplandor radial de fondos |

### Colores — Dark (mocks de producto/terminal)
`--bg #08090b · --bg-2 #0c0e12 · --surface #111419 · --surface-2 #161a20 · --fg #f3f5f7 · --fg-2 #aab2bd · --fg-3 #6b727d · --accent #4fe9a6`

### Colores de marca de las IAs (fijos en ambos temas)
| IA | Hex |
|---|---|
| Claude | `#d97757` |
| Codex | `#2dd4a7` |
| Gemini | `#5b9cff` |

### Tipografía
- **Sans:** `Geist` (400/500/600/700) — `system-ui` fallback. Vía Google Fonts o `next/font`.
- **Mono:** `Geist Mono` (400/500/600) — usada en eyebrows, labels, badges, contadores, OS hint.
- Body: `17px / 1.6`, `letter-spacing: -0.01em`.
- Headings: `font-weight: 600`, `letter-spacing: -0.03em`, `line-height: 1.08`.
- **Hero h1:** `clamp(38px, 6.6vw, 76px)`, `letter-spacing: -0.045em`.
- **Section h2 (`.h-section`):** `clamp(28px, 4.2vw, 46px)`, `letter-spacing: -0.035em`, `line-height: 1.12`, `padding-bottom: 0.08em` (evita recorte de acentos/descendentes — importante).
- **Eyebrow:** Geist Mono, `12.5px`, `letter-spacing: 0.12em`, `text-transform: uppercase`, color `--accent`, con un cuadradito `6px` de acento antes (radius 2px + glow).
- **Sub-section:** `clamp(16px, 1.6vw, 19px)`, color `--fg-2`, `max-width: 56ch`.

### Radios
`--r-sm: 8px · --r: 14px · --r-lg: 22px` · botones y pills `999px`.

### Espaciado / layout
- Contenedor: `--maxw: 1140px`, padding lateral `--gut: clamp(20px, 5vw, 40px)`.
- Sección: `padding-block: clamp(64px, 9vw, 120px)`; `.section--tight: clamp(44px, 6vw, 72px)`.
- `section-head` margin-bottom: `clamp(36px, 5vw, 56px)`.

### Easing / motion
- `--ease: cubic-bezier(.22,.61,.36,1)`.
- Reveal on scroll: opacidad 0→1 + `translateY(18px)→0`, `.6s var(--ease)`. **Base visible**; animar *desde* oculto solo con JS y respetar `prefers-reduced-motion`.
- Botones: `:active { transform: scale(.97) }`; primary hover `translateY(-1px)` + sombra más amplia.

---

## Componentes clave

### Botón primario (`.btn-primary`)
- `background: var(--accent)`, `color: var(--accent-ink)`, `font-weight: 600`.
- `padding: 13px 22px`, `border-radius: 999px`, `font-size: 15.5px`.
- `box-shadow: 0 8px 30px -10px var(--accent)`; hover → `0 10px 40px -8px var(--accent)` + `translateY(-1px)`.
- `.btn-sm`: `padding: 10px 16px`, `font-size: 14px`.

### Botón secundario (`.btn-ghost`)
- Fondo translúcido, `border: 1px solid var(--line-2)`, `color: var(--fg)`.

### Nav (sticky)
- `position: sticky; top: 0`, `backdrop-filter: blur(14px)`, fondo `color-mix(in srgb, var(--bg) 78%, transparent)`.
- Borde inferior aparece al hacer scroll (`.scrolled`).
- Logo (`logo.png`, 26px radius 7px) + wordmark "TerminalSync".
- Links: `--fg-2` → `--fg` en hover.
- Derecha: toggle **ES/EN** (mono), botón "Descargar" con sub-label OS `macOS · Linux · Windows` (mono, 9.5px) DEBAJO del botón.

### Botón de descarga del catálogo
- CTA principal en detalles: **"Descargar TerminalSync"** (reemplaza el BuyButton/Stripe en kits — los kits son **gratis**).

### Tarjeta de catálogo (`.kit-card`)
- `background: var(--surface)`, `border: 1px solid var(--line)`, `border-radius: 14px`, `padding: 22px`.
- Hover: `border-color: var(--accent-line)`, `translateY(-2px)`, `box-shadow: 0 14px 36px -22px rgba(15,40,30,.35)`.
- Icono `44px` radius 11px, fondo `--accent-soft`, texto `--accent`, mono — placeholder de 2 letras (en producción usar el logo real del item).
- `badge-free`: "Gratis", mono 11px uppercase, `--accent` sobre `--accent-soft`, borde `--accent-line`, pill.

### Badges de tipo (detalle)
- `tag-install` ("Instalable"): `--accent` sobre `--accent-soft` + `--accent-line`. → corresponde a `hasManifest: true`.
- `tag-affiliate` ("Vía proveedor"): `--fg-2` sobre `--surface-2` + `--line-2`. → corresponde a `hasManifest: false` (CTA externo al proveedor).

### Barra de categorías (espejo del cajón "Integraciones")
- Sticky bajo el nav. Pills: **Kits (17) · Conectores (13) · Asistentes (8) · Herramientas CLI (5)**.
- Activa: `--accent` sobre `--accent-soft` + `--accent-line`. Contador en mono dentro de la pill.
- (Los números son de muestra; en producción vienen del catálogo real.)

### Franja "Arrastra a tu sesión"
- Borde punteado `--accent-line`, fondo `--accent-soft`, texto `--accent`, icono de flecha hacia abajo. Refuerza que el app desktop es la superficie real de instalación.

---

## Screens / Views

### 1. Landing (`index.html` → `src/app/[lang]/page.tsx`)
Orden de secciones (ya compactado y aprobado):
1. **Hero** — h1 **rotativo** (cambia ~6.5s entre mensajes maestros), subtítulo, línea de resultados ("Seguimientos · Propuestas · Portales · Reportes · Automatizaciones — creados por IAs mientras trabajas"), CTAs (Empieza gratis / Descargar), badge OS bajo el botón, badges de confianza (Claude·Codex·Gemini incluidas · Listo en minutos · Cifrado E2EE · macOS·Linux·Windows). Imagen del **home real** (`assets/dashboard.png`) reemplaza el panel oscuro.
2. **Video** — `<video>` con poster; placeholder si no hay `assets/terminalsync.mp4`.
3. **Demos** — eyebrow "Por qué la gente cambia en 30 segundos" + h2 "Tres momentos en los que dices 'wow'". Tres demos embebidos (ver abajo).
4. **Cómo funciona**
5. **Casos de uso** ("Hecho para tu negocio, sea cual sea") — subido alto a propósito.
6. **Tu equipo de IAs** + cambio en un clic (logos reales, relay Claude→Codex→Gemini).
7. **Calculadora de ahorro** — titular con número grande ("Estás dejando $X sobre la mesa cada año"), sliders en vivo (tu hora, horas/día, días/mes, mezcla, horas re-explicando).
8. **El cambio real** — comparación unificada sin/con (memoria + continuidad integradas).
9. **Comparativo** — tabla "Lo que ninguna otra IA hace por ti".
10. **Extensión Chrome**
11. **Precios**
12. **Seguridad / privacidad** (E2EE; NO mencionar "sin internet/offline" — se eliminó).
13. **FAQ · Afiliados · CTA final · Footer**

### 2–5. Catálogo (listados) → páginas existentes en `src/app/[lang]/{stacks,connectors,skills,cli-tools}/page.tsx`
- Cabecera (eyebrow + h1 + lead) → barra de categorías sticky → toolbar (buscador + contador) → grid de tarjetas (3 col → 2 → 1) → franja "Arrastra a tu sesión".
- Buscador filtra client-side por nombre/texto.

### 6–9. Catálogo (detalles) → `[slug]/page.tsx` existentes
- Breadcrumb → hero del item (icono grande 76px, h1, sub, badges, CTA "Descargar TerminalSync" + OS) → cuerpo en 2 columnas: **"Qué incluye / Qué hace"** (lista de items con logo, nombre, descripción, badge install/affiliate) + **aside sticky "Cómo se instala"** (3 pasos: Descarga → Explorar → Arrastra) → **relacionados** (grid de 3 tarjetas).

## Interactions & Behavior
- **Hero rotativo:** intervalo ~6.5s, fade + leve translate; respetar `prefers-reduced-motion`.
- **Buscador catálogo:** input → filtra tarjetas, actualiza contador, muestra estado vacío.
- **Nav:** añade `.scrolled` (borde inferior) tras `scrollY > 8`.
- **Demos:** ver sección dedicada.
- **Reveal on scroll:** IntersectionObserver, base visible (no romper SSR/print).
- **Toggle ES/EN:** el prototipo del landing ahora trae i18n FUNCIONAL (`i18n.js`: diccionario ES↔EN + walker de nodos de texto, persistente; rotador/casos de uso/calculadora language-aware). En producción **no** portar `i18n.js` — usar el i18n real `[lang]` del middleware; el diccionario sirve como fuente de copy EN.

## Demos (3) — `demo-*.html`
Son piezas autocontenidas; recrear como componentes client (`"use client"`).
1. **`demo-cambio-ia.html` — Cambio de IA en un clic.** Réplica del chat de Terminal Sync (tema claro, burbujas de usuario índigo, tarjetas de respuesta con borde por IA: Claude naranja, Codex verde, Gemini azul). Autoplay al entrar en viewport: pregunta → Claude → menú ⇄ → Codex → Gemini, con **texto PRE-CARGADO** (constantes `CLAUDE_SAMPLE/CODEX_SAMPLE/GEMINI_SAMPLE`). Botón "Reproducir de nuevo". **No requiere API.** (El `window.claude.complete` con relay al padre es solo para el modo "escribe tú mismo" del standalone; en producción se omite o se cablea a tu backend.)
2. **`demo-sync-dispositivos.html` — Continuidad entre dispositivos.** Animación CSS/JS: portátil → sync nube → desktop enciende → aparece la misma conversación. Sin dependencias.
3. **`demo-conectores.html` — Integraciones drag & drop.** Arrastra Notion/Gmail a una sesión → instala con pop + toast. Autoplay + interacción manual. Texto "Conecta kits exclusivos, conectores y asistentes (skills) arrastrándolos. Cero código."

## State Management
- Hero: índice del mensaje rotativo (timer).
- Catálogo: query de búsqueda (string) → lista filtrada.
- Demos: estado de reproducción/IA activa (timers/Promises); en React → `useState` + `useEffect` con IntersectionObserver y cleanup.
- Reutilizar el data-fetching existente (catálogo/Supabase) — **no** introducir nuevo estado de datos.

## Iconografía
- El HTML usa SVGs inline (estilo feather/Phosphor stroke ~2) como placeholder. **Reemplazar por `lucide-react`** (ya en deps): search, arrow-down, arrow-right, check, repeat/refresh-cw, shield, etc.
- Logos de IAs: Claude/Gemini vía Simple Icons CDN; **OpenAI/Codex auto-alojado** en `assets/openai.svg` (Simple Icons quitó la marca de OpenAI). Logos de conectores: `cdn.simpleicons.org/<slug>/<hex>` con fallback a iniciales — en producción, preferir alojarlos localmente si el CSP bloquea externos.

## Assets (en `assets/`)
- `logo.png` — wordmark/marca TerminalSync (nav + footer).
- `dashboard.png` — screenshot del home real (hero). Reemplazar por la versión EN cuando exista para `/en`.
- `openai.svg` — logo de OpenAI/Codex auto-alojado.
- **Falta:** `assets/terminalsync.mp4` (+ opcional `.mov` y `video-poster.jpg`) — video corporativo del hero, lo sube el cliente.

## Files (referencias de diseño en este bundle)
- `screenshots/` — capturas de cada pantalla (referencia visual del objetivo):
  - `01-landing.png`, `02-stacks-listado.png`, `03-stack-detalle.png`, `04-connectors-listado.png`, `05-connector-detalle.png`, `06-skills-listado.png`, `07-cli-tools-listado.png`, `08-demo-cambio-ia.png`, `09-demo-conectores.png`, `10-demo-sync.png`.
- `index.html` — landing completo.
- `stacks.html` / `stack-detalle.html` — Kits (listado + detalle).
- `connectors.html` / `connector-detalle.html` — Conectores.
- `skills.html` / `skill-detalle.html` — Asistentes.
- `cli-tools.html` / `cli-detalle.html` — Herramientas CLI.
- `demo-cambio-ia.html`, `demo-sync-dispositivos.html`, `demo-conectores.html` — demos.
- `styles.css` — sistema completo (tokens, tipografía, botones, nav, secciones).
- `catalog.css` — estilos específicos del catálogo (tarjetas, tabs, detalle).
- `assets/` — logo, dashboard, openai.svg.

## Mapeo a rutas del repo
| Diseño (HTML) | Ruta producción |
|---|---|
| `index.html` | `src/app/[lang]/page.tsx` |
| `stacks.html` | `src/app/[lang]/stacks/page.tsx` |
| `stack-detalle.html` | `src/app/[lang]/stacks/[slug]/page.tsx` |
| `connectors.html` | `src/app/[lang]/connectors/page.tsx` (+ `Explorer.tsx`) |
| `connector-detalle.html` | `src/app/[lang]/connectors/[slug]/page.tsx` |
| `skills.html` / detalle | `src/app/[lang]/skills/…` |
| `cli-tools.html` / detalle | `src/app/[lang]/cli-tools/…` (+ `Explorer.tsx`, `Logo.tsx`) |
| tokens / globals | `src/app/globals.css` (o tema Tailwind) |

## Reglas de negocio a respetar (del cliente)
1. **NO** incluir `/marketplace` — se está retirando (PR #93, pasa a 301).
2. Kits **gratis** — cero precio/carrito/Stripe en kits.
3. El cajón de Integraciones del app desktop es la superficie principal; estas páginas web son **SEO + discovery** (su rol es convencer de instalar TerminalSync).
4. Mantener categorías y lenguaje del cajón: **Kits / Conectores / Asistentes / Herramientas CLI**.
5. Mantener el **i18n EN/ES** existente; los textos ES de aquí son la fuente, traducir al EN con el sistema actual.
