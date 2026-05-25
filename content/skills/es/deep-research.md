---
name: Deep Research
vendor: community
logo: /skills/deep-research.svg
category: research
status: soon
simpleTitle: "Investigación multi-fuente en un prompt"
simpleSubtitle: "Claude lee, cruza referencias y cita — como un analista junior, pero en 90 segundos."
devTitle: "Deep Research Skill"
devSubtitle: "Loop iterativo de search/fetch/synthesize con tracking de citas."
ctaUrl: "https://terminalsync.ai/skills/deep-research"
affiliate: false
tagline: "Investigación con citas en background"
tsInstallable: true
author: "TerminalSync"
license: "proprietary"
---
Preguntá *"¿cuáles son las 3 mejores prácticas de retención para fintechs latam en 2025, con fuentes?"* — Claude busca, lee, cruza y te entrega un brief con footnotes. Se acabaron las 40 pestañas abiertas.

Próximamente. Anotate en la lista de espera desde tu dashboard de Terminal Sync.

--- dev ---

La skill Deep Research orquesta un loop search → fetch → synthesize:

1. Descompone la query en 3-7 sub-queries
2. Ejecuta cada una contra el backend de búsqueda configurado (Brave, Tavily, o el tuyo)
3. Trae top-K resultados, deduplica por canonicalización de URL
4. Genera un brief estructurado con citas inline `[N]` referenciando una tabla de fuentes

En beta privada — early-access para suscriptores TS primero.
