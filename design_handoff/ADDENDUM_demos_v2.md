# Addendum de handoff — Demos rediseñados (posterior a Fases 1–5)

Este documento cubre **cambios nuevos hechos DESPUÉS** de que las Fases 1–5 ya entraron a producción. Aplica sobre `src/app/[lang]/page.tsx` (sección de demos) y su CSS/Tailwind. **No** rehace nada de las fases ya mergeadas.

> Fuente de verdad: `design_handoff_landing_catalog/` — `index.html` (sección `#demos`), `styles.css` (bloques de `.demos-grid`, `.demo-frame`, `.demo-clickcatch`, `.lightbox`), `demo-ai-director.html`, y los 3 demos previos.

---

## 1. Sección de demos → grilla de pares (2 columnas)

**Antes:** 3 demos apilados a todo el ancho, cada uno con su encabezado grande.
**Ahora:** grilla de **2 columnas** con **6 tarjetas** (3 pares), cada una con título compacto.

- Título de sección: **`Momentos en los que dices: "¡Guau!"`** (EN: `Moments that make you say: "Wow!"`). Eyebrow: `Por qué la gente cambia en 30 segundos`.
- Orden de las tarjetas:
  1. **Cambio de IA en un clic** — "Cada tarea necesita un especialista." → `demo-cambio-ia`
  2. **AI Director** — "Un director que elige por ti." → `demo-ai-director` *(NUEVO, ver §4)*
  3. **Continuidad entre dispositivos** — "Empieza en el portátil. Sigue en la oficina." → `demo-sync-dispositivos`
  4. **Integraciones** — "Dale nuevas habilidades a tu equipo de IAs." → `demo-conectores`
  5. **Trabajo desde el celular** — *placeholder "Demo en camino"* (aún sin demo)
  6. **Asistente de prompts** — *placeholder "Demo en camino"* (aún sin demo)
- Grilla: `grid-template-columns: 1fr 1fr; gap: 30px 28px;` → 1 columna en ≤880px.
- Cada tarjeta: header centrado (eyebrow + h3 `clamp(19px,2vw,24px)` + p `14.5px`, `max-width:46ch`) sobre el `.demo-frame`.
- Placeholders (`.demo-card.coming`): marco con borde **punteado**, sin iframe, contenido centrado: icono en chip esmeralda + label mono "Demo en camino" + una línea. (Celular: icono de teléfono. Asistente de prompts: icono de chispa.)

## 2. Preview borroso + botón "Ver demo" (en la grilla)

Para que la grilla no muestre movimiento/scroll de los demos:
- El **iframe en la grilla** va **desenfocado y sin interacción**: `filter: blur(3px) saturate(1.04); transform: scale(1.04); pointer-events: none;`
- Encima, una capa `.demo-clickcatch` (`position:absolute; inset:0; z-index:3; cursor:zoom-in;`) con un velo (`background: color-mix(in srgb, var(--bg) 34%, transparent)`) y un botón centrado **"Ver demo"** (`.demo-cta`, pill esmeralda con icono ▶). EN: "See demo".
- El demo **NO se reproduce a la vista** en la grilla (queda como cartel quieto); solo se reproduce al ampliarse.

## 3. Lightbox (clic para ampliar)

- Clic en cualquier parte de un demo (la capa `.demo-clickcatch`) abre un **lightbox** a casi pantalla completa donde el demo se ve **nítido e interactivo** y se reproduce desde el inicio.
- Implementación de referencia: se **mueve el `<iframe>` vivo** al contenedor del modal (`#lbBody`) y se regresa a su tarjeta al cerrar (un comentario placeholder marca su posición). Al moverse, el iframe recarga → el demo arranca limpio. Al salir del selector `.demo-frame iframe`, **pierde el blur** automáticamente.
  - En React, equivalente: portal/modal con el demo (componente o iframe) renderizado a tamaño grande; el de la grilla, blurreado y sin pointer-events. No es obligatorio "mover el nodo": basta con NO autoplay en la grilla y SÍ en el modal.
- Barra del modal: dots + título (la `bw-url` del demo) + botón **Cerrar**.
- Cierra con: botón Cerrar, clic en el velo, o **Esc**.
- **Bug a evitar:** el handler de cierre debe usar `e.target.closest('[data-close]')`, **no** `hasAttribute` — si no, clic en el ícono/el texto interno del botón no cierra.

## 4. Demo "AI Director" (NUEVO) — recomendación de modo / IA + ahorro

Réplica fiel del modal real de recomendación del Lab. Componente client (`"use client"`).

- Chrome de la app (top bar, sidebar, tabs, subhead con **"Modo: [X]"**, chat, composer) — igual que los otros demos.
- Flujo (autoplay al ampliarse): mensaje de usuario → "pensando…" → respuesta de la IA actual → aparece la **tarjeta de recomendación** → auto-"Aplicar" → confirmación.
- **Tarjeta de recomendación** (estilo ámbar, fiel al real):
  - Header: `⚡ RECOMENDACIÓN` + `Confianza NN%`.
  - Razón (1 línea), p.ej. *"Consulta liviana — Modo Rápido es eficiente para esto."*
  - Línea de acción (ámbar, con flecha →), **dos formatos**:
    - **Cambio de modo:** `Seguir con [IA] pero en Modo [X]` (EN: `Stay on [IA] but in [X] mode`)
    - **Cambio de IA:** `Cambiar a [IA]` (EN: `Switch to [IA]`)
  - Ahorro (verde): `$0.0NN ahorro estimado por turno (NN% vs Modo Experto)` (EN: `… estimated savings per turn (NN% vs Expert mode)`).
  - Botones: **Aplicar** (ámbar), **Mantener actual**, **✕ No sugerir**.
  - Al Aplicar: estado "aceptado" (verde) + confirmación *"Aplicado · Modo [X] · contexto intacto"* / *"Cambiado a [IA] · contexto intacto"*; el pill "Modo:" se actualiza si fue cambio de modo.
- 4 escenarios rotando con "Otro ejemplo": (1) Drive→HTML → Modo Rápido, (2) email de seguimiento → Modo Avanzado, (3) resumen de PDFs → Modo Avanzado, (4) captura→HTML → **Cambiar a Gemini**.
- **Honestidad de roadmap:** la recomendación de **modo** (Rápido/Avanzado/Experto) es la feature real. El **cambio por IA** (Cambiar a Gemini) y la comparación de costo entre modelos son **visión/roadmap** — preséntalo como tal si en producción aún no existe el routing por-IA.

## 5. i18n

Todos los textos nuevos están en ES con su EN en `i18n.js` (prototipo) — úsalo como **fuente del copy EN**, pero implementa con el i18n real `[lang]`. Claves nuevas: títulos de las 6 tarjetas, "Ver demo"/"See demo", "Demo en camino"/"Demo on the way", el título de sección, y todo el copy del AI Director (ver `demo-ai-director.html`, objeto `T`).

## 6. Checklist para Claude Code

- [ ] Sección demos → grilla 2 col, 6 tarjetas (4 demos + 2 placeholders), nuevo título.
- [ ] Iframes/demos de la grilla: blur + sin interacción + sin autoplay; botón "Ver demo".
- [ ] Lightbox: abrir al clic, demo nítido e interactivo, cerrar por botón/velo/Esc (usar `closest('[data-close]')`).
- [ ] Integrar el demo **AI Director** (recomendación de modo/IA + ahorro, 4 escenarios, bilingüe).
- [ ] Placeholders "Demo en camino" para Celular y Asistente de prompts.
- [ ] i18n EN de todo lo nuevo con el sistema `[lang]`.
- [ ] No romper Stripe/Supabase ni el resto de la página.
