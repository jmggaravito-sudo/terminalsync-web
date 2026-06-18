# Checklist de migración — Fases 3–5 (terminalsync.ai)

Estado actual en producción (auditado en vivo): **Fase 1 (tema) y Fase 2 (hero + nav) LIVE**. El resto de la página todavía tiene **secciones viejas** → se ve "mezclado". Este checklist resuelve la mezcla y deja la página idéntica al rediseño aprobado.

> Fuente de verdad del diseño: el handoff `design_handoff_landing_catalog/` (HTML + `i18n.js` con el copy EN). Aplicar la capa visual sin romper i18n `[lang]`, Stripe, Supabase ni Resend.

---

## A. Secciones a ELIMINAR (no existen en el rediseño)

- [ ] **"Lo que acabas de ver no es un chatbot."** — borrar por completo.
- [ ] **"Qué puedes construir" / "Construye lo que tu negocio necesita"** (lista de chips: seguimiento, ficha de clientes, dashboard…) — borrar.
- [ ] **"La IA construye. Tú lo ves." / "Resultados visibles"** (tabs Sitios web / Dashboards / Portales…) — borrar (era redundante con video + demos).
- [ ] **Sección de Memoria independiente "Tu IA aprende de ti — Día 1 / Día 30"** — borrar como sección suelta; su mensaje YA va integrado dentro de **"El cambio real"** (comparación unificada sin/con).
- [ ] **Footer → link "Marketplace"** — eliminar (página retirada, PR #93, ahora 301).

## B. Secciones a REEMPLAZAR

- [ ] **Demos** — hoy son 3 bloques de TEXTO (Persistencia / Cualquier dispositivo / Privacidad). Reemplazar por los **3 demos INTERACTIVOS** del handoff, como componentes client (`"use client"`):
  - `demo-cambio-ia` — cambio de IA en un clic (autoplay Claude→Codex→Gemini, **texto pre-cargado, sin API**).
  - `demo-sync-dispositivos` — continuidad portátil → desktop (animación).
  - `demo-conectores` — integraciones drag & drop (Notion/Gmail).
  - Encabezado de la sección: eyebrow *"Por qué la gente cambia en 30 segundos"* + h2 *"Tres momentos en los que dices 'wow'"*.
- [ ] **Tabla comparativa** — hoy es la vieja, larga, **con columna "Vercel"** y filas de internet/WhatsApp. Reemplazar por la **unificada** del handoff:
  - Columnas: **Capacidad · TerminalSync · Claude solo · Codex solo · Gemini solo** (sin Vercel).
  - Filas exactas del handoff (9): retoma donde quedaste · varias IAs juntas · sigue trabajando aunque cierres todo · misma sesión en navegador/celular · avisos por correo y Telegram · cifrado fuerte · bóveda de claves · memoria entre sesiones · tus archivos en tu nube.
  - Marcas: Sí / No / Parcial.

## C. COPY a corregir (en TODA la página + metadatos)

- [ ] **Eliminar toda mención de "internet / sin internet / offline / funciona sin internet / se cae el internet"** — en secciones, tabla, FAQ Y en la **meta-description / OG description / Twitter** (hoy dicen *"…aunque se caiga el internet…"*). Reemplazar meta por la del handoff (enfoque memoria/continuidad/privacidad/movilidad, sin internet).
- [ ] **Eliminar "WhatsApp"** como canal — dejar solo **Email / Telegram** (en comparativa, en "El cambio real" y en Precios Pro: "Notificaciones por Email / Telegram").
- [ ] **"El cambio real"** — usar las 6 viñetas sin/con del handoff (incluye memoria + continuidad + bóveda + móvil + contexto compartido). Quitar la viñeta *"Se cae el internet — tu IA sigue igual, sin conexión"*.

## D. ORDEN de secciones (handoff)

```
Hero → Video → Demos → Cómo funciona → Casos de uso →
Tu equipo de IAs (+ relay 1-clic) → Calculadora →
El cambio real (comparación unificada) → Comparativo (tabla) →
Extensión Chrome → Precios → Seguridad → FAQ → Afiliados → CTA final → Footer
```
- [ ] **Casos de uso** va ARRIBA (justo tras Cómo funciona), no al final.
- [ ] **Calculadora** justo después de "Tu equipo de IAs".

## E. Detalles que YA están bien (no tocar)

- ✅ Tema papel + esmeralda + Geist (Fase 1).
- ✅ Hero: chips IAs, eyebrow "Piensan, construyen y ejecutan", h1 rotativo, línea de resultados, dashboard real, nav de 4 ítems sin Marketplace (Fase 2).

## F. Fase 4 — Catálogo (capa visual sobre data real)

- [ ] `stacks`, `connectors`, `skills`, `cli-tools` (listados + `[slug]`): aplicar tarjetas nuevas, barra de categorías sticky, franja "Arrastra a tu sesión".
- [ ] **No tocar** el data-fetching (Supabase) ni los `Explorer.tsx`.
- [ ] Badges **Instalable** (`hasManifest:true`) vs **Vía proveedor** (`hasManifest:false`).
- [ ] Kits **gratis** — sin precio/Stripe; CTA detalle = **"Descargar TerminalSync"**.

## G. Verificación final

- [ ] Toggle **ES/EN** traduce todo (usar i18n `[lang]`; el copy EN está en `i18n.js` del handoff como fuente).
- [ ] Sin secciones duplicadas ni "mezcla" visual.
- [ ] Sin links muertos (Marketplace).
- [ ] Stripe checkout y afiliados siguen funcionando.
