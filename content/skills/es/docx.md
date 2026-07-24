---
name: DOCX
vendor: anthropic
author: "Anthropic"
logo: /skills/docx.svg
category: productivity
status: available
simpleTitle: "Documentos Word en piloto automático"
simpleSubtitle: "Borradores, propuestas, reportes — Claude los escribe en tu tono y exporta un .docx limpio."
devTitle: "DOCX Skill"
devSubtitle: "Skill oficial de Anthropic para generación, edición y styling de archivos `.docx`."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "Docs Word sin pelea"
tsInstallable: true
included: true
---
Decile a Claude qué necesitás: *"Armá una propuesta para Acme basada en los wins del trimestre pasado, formato nuestro de 4 páginas"*. Claude escribe, formatea y exporta el .docx — vos lo abrís en Pages o Word y lo mandás.

Combinala con Notion o Drive para que el contenido fuente venga automático.

--- dev ---

La skill oficial DOCX expone operaciones tipo `python-docx` vía toolset de Claude:

- Generar documentos desde templates con placeholders
- Aplicar styling a párrafos y runs (headings, listas, tablas)
- Workflows de track changes / aceptar-rechazar
- Embed de imágenes, footnotes, headers/footers

Después de instalar con Terminal Sync, la skill vive en `~/.claude/skills/docx/` en cada máquina — incluso una Mac que conectes mañana.
