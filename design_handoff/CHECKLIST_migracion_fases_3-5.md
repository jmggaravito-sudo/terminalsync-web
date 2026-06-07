# Checklist — Migración del rediseño (Fases 3–5)

Estado de la implementación del *handoff* "Rediseño Landing + Catálogo" en
`terminalsync-web`. Rama: `landing/copy-es-neutro` → mergeada a `main`
(producción auto-deploy en Vercel · `terminalsync.ai`).

Leyenda: ✅ hecho y en producción · 🟡 parcial · ⬜ pendiente.

---

## Fases ya completas (contexto)

### Fase 1 — Tema base ✅
- ✅ Tokens claros "papel cálido" (`--color-bg #f7f5f1`) + esmeralda (`--color-accent #0f9d6e`) en `globals.css`.
- ✅ Fuente **Geist** (sans + mono) vía Google Fonts en `layout.tsx`.
- ✅ Colores de marca IA (`--color-codex`, `--color-gemini`); dark toggle a esmeralda.
- ✅ Highlight del hero pasa de naranja → esmeralda.

### Fase 2 — Hero + Nav ✅
- ✅ Hero: chips Claude/Codex/Gemini + eyebrow "Piensan, construyen y ejecutan. Tú diriges el equipo.".
- ✅ H1 **rotativo** (7 frases maestras, ~6.5s, fade + dots, reduced-motion).
- ✅ Subtítulo + línea de resultados ("Seguimientos · Propuestas · … creados por tus IAs mientras trabajas").
- ✅ CTAs (Empieza gratis / Mira cómo funciona) + OS sublabel + trust line.
- ✅ Imagen del **dashboard real** (`public/redesign/dashboard-hero.png`) en vez del mock dibujado.
- ✅ Nav: 4 ítems (Cómo funciona · Tu equipo de IAs · Catálogo · Precios); **Marketplace fuera**.
- ✅ Menú móvil (hamburguesa).

---

## Fase 3 — Secciones de la landing

- ✅ **Orden del handoff** (compactado) aplicado en `src/app/[lang]/page.tsx`:
  Hero → Demos → Cómo funciona → Lo que puedes resolver → Casos → Tu equipo + relay (Continuity) → Memoria → Calculadora → El cambio real (BeforeAfter) → Comparativo → Chrome → Precios → Seguridad (Trust) → FAQ → Afiliados → CTA final → Footer.
- ✅ Quitadas del home las 3 secciones que el handoff fusionó (WhatYouJustWatched, VisibleResults, Capabilities → Capabilities pasa a Catálogo).
- ✅ Calculadora: original + **ahorro por Memoria persistente** (horas/semana re-explicando contexto).
- 🟡 Secciones heredan el tema nuevo, pero **falta el layout exacto** del diseño en algunas:
  - ⬜ **Video** (`#video`) — sección dedicada con `<video>` + poster; falta `public/.../terminalsync.mp4` (lo sube el cliente).
  - ⬜ **Seguridad/Privacidad** — revisar que `Trust` matchee el diseño (E2EE; **no** mencionar "sin internet/offline").
  - ⬜ "Tu equipo de IAs" — relay visual Claude→Codex→Gemini con logos reales (hoy es la sección MultiAI + Continuity).
  - ⬜ Demos (header) — el bloque `Demos` viejo coexiste con los demos nuevos; unificar bajo "Tres momentos en los que dices 'wow'".

## Fase 4 — Catálogo (capa visual sobre data real)

> Regla del handoff: **cambiar solo la CAPA VISUAL**, no el data-fetching (Supabase/Explorer).

- ⬜ **Listados** (`stacks`, `connectors`, `skills`, `cli-tools` → `page.tsx`):
  - ⬜ Cabecera (eyebrow + h1 + lead).
  - ⬜ **Barra de categorías sticky** (Kits · Conectores · Asistentes · Herramientas CLI, con contador mono).
  - ⬜ Toolbar (buscador client-side + contador) + estado vacío.
  - ⬜ Grid de **`kit-card`** nuevas (icono 44px, badge "Gratis", hover).
  - ⬜ Franja **"Arrastra a tu sesión"** (borde punteado esmeralda).
- ⬜ **Detalles** (`[slug]/page.tsx`):
  - ⬜ Breadcrumb → hero del item (icono 76px, badges install/affiliate) → CTA **"Descargar TerminalSync"** (sin Stripe — kits gratis).
  - ⬜ Cuerpo 2 columnas: "Qué incluye / Qué hace" + aside sticky "Cómo se instala" (Descarga → Explorar → Arrastra).
  - ⬜ Relacionados (grid de 3).
- ⬜ Quitar precios/Stripe de kits (kits **gratis**).
- ✅ (ya hecho por otro merge) `/marketplace` retirado.

## Fase 5 — Demos interactivos

- ✅ **Demo 1 — Cambio de IA en un clic** (`DemoCambioIA.tsx`): chat replay autoplay + replay, relay Claude→Codex→Gemini, texto pre-cargado, reduced-motion. En la home bajo Demos.
- ⬜ **Demo 2 — Continuidad entre dispositivos** (`demo-sync-dispositivos.html`): portátil → sync nube → desktop enciende → misma conversación. CSS/JS, sin deps.
- ⬜ **Demo 3 — Conectores drag & drop** (`demo-conectores.html`): arrastrar Notion/Gmail → instala con pop + toast. Autoplay + manual.
- ⬜ Unificar los 3 demos en la sección "Demos" con su header del diseño.

---

## Pendientes transversales

- ⬜ **i18n EN** de los textos nuevos del rediseño (hero results line ya bilingüe; demos/catálogo por traducir).
- ⬜ Iconografía: reemplazar SVGs inline del HTML por **lucide-react** (parcial: hero/nav/calc/demo ya usan lucide).
- ⬜ Logos de IAs/conectores: preferir auto-alojados si el CSP bloquea CDNs externos.
- ⬜ Assets del cliente: `terminalsync.mp4` (+ poster) y `dashboard.png` versión EN.
- ⬜ Reemplazar imágenes/íconos placeholder por los reales del catálogo.

---

_Actualizar este checklist a medida que cada ítem entra a producción._
