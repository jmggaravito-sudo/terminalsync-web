---
name: SEO Auditor
logo: /skills/seo-auditor.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Auditoría SEO con evidencia y límites"
description: "Audita una URL o datos de página provistos, prioriza problemas SEO por impacto probable y declara evidencia, límites de acceso e incertidumbre antes de hacer claims de ranking."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Tenés una URL, export de página, crawl, datos de Search Console o HTML y querés una auditoría SEO ordenada por impacto probable.
- Sospechás problemas de indexación, canonical, robots, sitemap, metadata, headings, structured data, internal linking o performance.
- Querés una lista de acciones práctica en vez de un checklist SEO genérico.
- Podés dar acceso suficiente para inspección: URL pública, HTML renderizado, screenshots, output de crawl o datos relevantes de analytics/search.

Si no hay URL ni datos de página, el skill debe pedirlos o aclarar que sólo puede dar un checklist de planificación. No debe afirmar que una página va a rankear, que el tráfico va a subir o que los ingresos van a mejorar sin evidencia y medición posterior.

## Qué hace

Produce una auditoría SEO priorizada con:

- **Nota de acceso**: qué se inspeccionó, qué no se pudo inspeccionar y qué datos mejorarían la auditoría.
- **Bloqueantes primero**: noindex, robots bloqueando, canonical incorrecto, redirects rotas, contenido indexable faltante, fallas graves de crawl.
- **Fixes de alto impacto**: mismatch title/H1, metadata duplicada, intent débil, schema faltante, internal links pobres, páginas críticas lentas, contenido thin.
- **Mejoras de menor prioridad**: alt text, pulir meta descriptions, higiene de sitemap, gaps chicos de contenido.
- **Evidencia por hallazgo**: síntoma observado, impacto probable en usuario/búsqueda, fix exacto, owner y esfuerzo estimado.
- **Límites de claims**: separa hallazgos verificados de hipótesis y evita garantías de ranking.

Sólo puede inspeccionar lo que el modelo o las herramientas conectadas puedan acceder. Si no hay render JavaScript, páginas autenticadas, Search Console, logs de servidor o Lighthouse, debe decirlo.

## Cómo usarlo

1. Pasá la URL objetivo y el objetivo de negocio: *"Auditá https://example.com/pricing para demo signups e intención SEO."*
2. Agregá país/idioma objetivo, keywords prioritarias, competidores, CMS y si la página es pública o gated.
3. Si el asistente no puede navegar, pegá HTML renderizado, screenshots, crawl, reporte Lighthouse o extractos de Search Console.
4. Pedí hallazgos agrupados como bloqueantes, alto impacto y menor prioridad, con evidencia y caveats.
5. Tratá las recomendaciones como hipótesis hasta que Search Console, crawl, analytics o datos de ranking confirmen el efecto.

## Ideal para

Founders, marketers, equipos de contenido y agencias que necesitan una primera auditoría SEO rápida con prioridades claras y límites honestos. Funciona mejor con URLs públicas o páginas donde el usuario puede aportar evidencia de crawl/search; es más débil para apps privadas, páginas muy dependientes de JavaScript sin HTML renderizado o mercados sin datos de keywords.
