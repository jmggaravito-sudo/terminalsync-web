---
name: PPTX
vendor: anthropic
logo: /skills/pptx.svg
category: documents
status: available
simpleTitle: "Decks armados en minutos, no en tardes"
simpleSubtitle: "Pitches de ventas, all-hands, revisiones con clientes — Claude compone las slides por vos."
devTitle: "PPTX Skill"
devSubtitle: "Skill oficial de Anthropic para presentaciones `.pptx`: layouts, slides master, charts, imágenes."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "PowerPoint a velocidad de prompt"
tsInstallable: true
---

*"Armá un deck de 10 slides para la review de mañana con el cliente. Bajá las métricas del mes pasado de Supabase, usá nuestro template, cerrá con un ask claro."* Claude arma, aplica tema y exporta — vos ajustás copy y presentás.

--- dev ---

La skill PPTX envuelve `python-pptx`:

- Layouts de slide desde un template master
- Charts (bar, line, pie) desde datos en memoria
- Inserción de imágenes con crop / aspect-fit
- Notas de speaker
- Consistencia de paleta de tema

Terminal Sync la deja en `~/.claude/skills/pptx/` y la mantiene sincronizada.
