# Addendum de handoff v3 — Demos, hero y nav (estado actual completo)

> **Reemplaza a `ADDENDUM_demos_v2.md`** (que quedó desactualizado). Cubre TODO lo nuevo hecho después de que las Fases 1–5 entraron a producción. Aplica sobre `src/app/[lang]/page.tsx` + su CSS/Tailwind. No rehace las fases ya mergeadas.
>
> **Fuente de verdad:** carpeta `design_handoff_landing_catalog/` — `index.html` (sección `#demos`, hero), `styles.css` (bloques `.demos-grid`, `.demo-frame`, `.demo-clickcatch`, `.lightbox`, `.shot-title`, `.trustbar`, `.nav-*`), `i18n.js` (copy ES/EN), y los **7 archivos `demo-*.html`**.

---

## 1. Hero — título sobre el screenshot + barra de confianza

Debajo del screenshot del producto en el hero (`assets/dashboard.png`):
- **Título encima del screenshot:** `.shot-title` — "Desde acá se maneja tu empresa." (EN: "This is where your business runs from."). `clamp(26px,4vw,42px)`, centrado, `max-width:18ch`.
- **Debajo del screenshot:** sub-flag "Tus espacios de trabajo de IA, sincronizados en todas partes."
- **Barra de confianza** (`.trustbar`): caption "Más de 2,000 empresas ya confían en TerminalSync" + fila de logos (Google · Notion · Slack · OpenAI · AWS · Miro). En el prototipo son `cdn.simpleicons.org` con **fallback a wordmark de texto**; en producción **aloja los SVG/PNG reales** en `assets/`. (El cliente entregará los logos definitivos.)

## 2. Nav centrado

El nav quedó **centrado**: logo a la izquierda, **enlaces centrados** (`.nav-links { flex:1; justify-content:center }`), bloque de descarga a la derecha (`.nav-right { margin-left:auto }`). Enlaces: Cómo funciona · Tu equipo de IAs · Catálogo · Precios. Badge OS (`macOS · Linux · Windows`) bajo el botón Descargar.

## 3. Sección de demos → grilla de pares, 7 demos (6 en el video)

- **Título de sección:** `Momentos en los que dices: "¡Guau!"` (EN: `Moments that make you say: "Wow!"`). Eyebrow: `Por qué la gente cambia en 30 segundos`.
- Grilla **2 columnas** (`grid-template-columns:1fr 1fr; gap:30px 28px;` → 1 col en ≤880px). Cada tarjeta: header centrado (eyebrow + h3 + p) sobre el `.demo-frame`.
- **7 tarjetas, todas con demo real** (ya no hay placeholders "Demo en camino"):

  | # | Tarjeta (eyebrow) | Archivo demo |
  |---|---|---|
  | 1 | Cambio de IA en un clic | `demo-cambio-ia.html` |
  | 2 | AI Director | `demo-ai-director.html` |
  | 3 | Resultados (trabajo terminado) | `demo-resultados.html` |
  | 4 | Continuidad entre dispositivos | `demo-sync-dispositivos.html` |
  | 5 | Integraciones (drag & drop) | `demo-conectores.html` |
  | 6 | Tu trabajo te sigue hasta el chat | `demo-mensajeria.html` |
  | 7 | Asistente de prompts | `demo-asistente-prompts.html` |

  (El orden exacto en `index.html` puede agruparse por pares; respeta el de ahí.)

## 4. Preview borroso + clic-para-ampliar (¡cambió desde v2!)

- El iframe en la grilla va **muy desenfocado y sin interacción**: `filter: blur(6px) saturate(1.02); transform: scale(1.06); pointer-events:none;` — queda como cartel **quieto** (sin movimiento ni scroll).
- **Ya NO hay botón "Ver demo".** Una capa `.demo-clickcatch` (`position:absolute; inset:0; z-index:3; cursor:zoom-in;`) cubre todo el demo: **un clic en cualquier parte** abre el lightbox. Al hover muestra una pista sutil (chip "Ampliar"/"Expand"), pero el área clickeable es todo el demo.
- El demo **no autoplay en la grilla**; solo se reproduce al ampliarse.

## 5. Lightbox (sin cambios de fondo desde v2, confirmado)

- Clic en `.demo-clickcatch` → **lightbox** casi a pantalla completa, demo **nítido e interactivo**, reproduce desde el inicio.
- Referencia: se **mueve el `<iframe>` vivo** a `#lbBody` y se regresa a su tarjeta al cerrar (un comentario marca su posición); al moverse recarga → arranca limpio y pierde el blur.
  - En React: portal/modal con el demo a tamaño grande; el de la grilla blurreado y sin pointer-events. Basta con **no autoplay en grilla, sí en modal** (no es obligatorio mover el nodo).
- Barra del modal: dots + título + **Cerrar**. Cierra con botón, clic en el velo, o **Esc**.
- **Bug a evitar:** el handler de cierre debe usar `e.target.closest('[data-close]')`, no `hasAttribute`.

## 6. Los 5 demos nuevos (todos client `"use client"`, bilingües ES/EN, autoplay al ampliarse + "Otro ejemplo"/"Reproducir de nuevo")

Cada uno replica el chrome real del Lab (top bar, sidebar, tabs, subhead, chat, composer) con el tema claro y los colores de marca de las IAs (Claude #d9774f · Codex #1f9d63 · Gemini #5b9cff). Burbujas de usuario índigo (#5b56e6); tarjetas de respuesta con borde de color por IA.

- **`demo-ai-director.html`** — recomendación de modo/IA + comparación de costo. Tarjeta ámbar `⚡ RECOMENDACIÓN` + confianza %, razón, fila de costos por IA (una marcada "Recomendado ✓"), ahorro estimado, botones Continuar/Mantener/No sugerir. 3 escenarios rotando (PDFs→Gemini, dashboard React→Codex, propuesta→Claude). **Roadmap:** el routing por-IA + costo entre modelos es visión; preséntalo como tal si aún no existe en producción.
- **`demo-resultados.html`** — "trabajo terminado, no chat". Vista de proyecto donde Claude→correo · Codex→documento · Gemini→revisión → **✅ Cotización enviada**. Rota verticales: **Broker** (genérico) · Agencia (✅ Campaña lista) · Ecommerce (✅ Publicado).
- **`demo-mensajeria.html`** — "Tu trabajo te sigue hasta el chat". Escena: desktop (terminal) a la izquierda, **teléfono** a la derecha. La misma conversación empieza en TerminalSync y continúa en **WhatsApp** (verde) → **Telegram** (azul); el cliente escribe desde el celular y se refleja en el desktop. Flujo: Claude topado → aviso → "Sí, seguí" → Gemini → "✅ Cotización $4.820 enviada". **Nota técnica:** el color de plataforma se aplica por **estilo inline en JS** (no por `transition` de `background-color`, que no progresa en algunos entornos de captura).
- **`demo-asistente-prompts.html`** — DOS botones contextuales bajo el composer: composer vacío → **"Responde por mí"** (redacta respuesta completa); con borrador → **"Arregla mi respuesta"** (abre "Sugerencia del coach": Prompt mejorado + Ortografía/gramática, ej. *czas→cosas*, botones Usar mejorado/Solo ortografía/Cerrar). El autoplay muestra **ambos en bucle**.
- **`demo-conectores.html`** — Integraciones drag & drop (Notion/Gmail/Drive a una sesión, instala con pop + toast). Ya existía; sin cambios.

## 7. i18n

Todo el copy nuevo está en `i18n.js` (prototipo) como **fuente del EN** — implementa con el i18n real `[lang]`. Cada demo trae su propio diccionario `T` (objeto ES/EN) y toggle ES/EN interno; en producción puedes cablear el idioma del demo al `[lang]` de la página.

## 8. Checklist para Claude Code

- [ ] Hero: título `.shot-title` sobre el screenshot + barra de confianza (logos reales en `assets/`).
- [ ] Nav centrado (links al centro, descarga a la derecha).
- [ ] Sección demos → grilla 2 col con **7 demos reales** (sin placeholders).
- [ ] Grilla: iframes con blur 6px + sin interacción + **sin autoplay**; **clic en cualquier parte** abre el lightbox (capa `.demo-clickcatch`, sin botón).
- [ ] Lightbox: demo nítido e interactivo, cerrar por botón/velo/Esc (`closest('[data-close]')`).
- [ ] Integrar los 5 demos nuevos (AI Director, Resultados, Mensajería, Asistente, + Integraciones ya existente), bilingües.
- [ ] i18n EN de todo lo nuevo con `[lang]`.
- [ ] No romper Stripe/Supabase, catálogo, ni el resto de la página.

## 9. Material de marketing (no es para producción, pero vive en el handoff)
- `guion-video.html` — guion del video corporativo, ES/EN, 2 versiones (Hero ~30s + completa ~68s). Cierre: "No necesitas aprender IA. Solo trabajar." Claim: "Cuando una IA se detiene, tu trabajo no." Categoría: "Las IAs se detienen. Tu negocio no."
- `plan-produccion-video.html` — shot list + voz en off + montaje.
- El MP4 final del hero va en `assets/terminalsync.mp4` (reemplaza el placeholder del `<video>`).
