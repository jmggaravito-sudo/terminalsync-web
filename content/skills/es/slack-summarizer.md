---
name: Slack Summarizer
logo: /skills/slack-summarizer.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: soon
hidden: true
tagline: "Resúmenes de Slack cuando está conectado"
description: "Resume canales y threads de Slack en decisiones, blockers, acciones y follow-ups, pero sólo cuando el conector Slack o mensajes pegados dan acceso."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Necesitás ponerte al día en Slack después de vacaciones, reuniones, focus time, incident response o un día ocupado.
- Tenés el conector Slack instalado con acceso al workspace, canales y threads relevantes.
- Podés aportar mensajes pegados o exports de Slack cuando el conector no está disponible.
- Querés un digest que separe decisiones, blockers, acciones, preguntas abiertas y mensajes que merecen lectura manual.

No lo uses para prometer acceso a Slack sin el conector Slack, scopes OAuth correctos y permisos de canal. Si Slack no está conectado y no hay mensajes pegados, el skill debe pedir el conector o texto fuente en vez de inventar un resumen.

## Qué hace

Crea un workflow para ponerse al día en Slack:

- **Selección de scope**: canales, usuarios, timeframe, profundidad de threads y temas prioritarios.
- **Recolección de mensajes**: lee mediante el conector Slack o usa mensajes pegados/exportados por el usuario.
- **Extracción de señal**: decisiones, blockers, acciones, owners, deadlines, preguntas y threads sin resolver.
- **Control de ruido**: comprime charla, reacciones, repeticiones y status pings de bajo valor.
- **Vista de follow-up**: resalta dónde mencionan al usuario, dónde se espera una decisión o dónde conviene leer el thread original.
- **Notas de límite**: declara cuando canales privados, mensajes borrados, replies faltantes o scopes del conector limitan el resumen.

Debe preservar incertidumbre y evitar atribuir decisiones u ownership si los mensajes fuente no lo sostienen.

## Cómo usarlo

1. Confirmá que el conector Slack está instalado y autorizado para el workspace/canales, o pegá/exportá los mensajes.
2. Especificá canales, timeframe y objetivo: *"Resumí #engineering y #product desde las 9am para decisiones y blockers."*
3. Pedí el formato deseado: TL;DR ejecutivo, lista de acciones, digest de incidente, catch-up de manager o daily log.
4. Revisá manualmente threads linkeados/prioritarios antes de actuar en decisiones sensibles.
5. Si falta el conector, instalá/conectá Slack o aportá los mensajes fuente.

## Ideal para

Managers, founders, PMs, engineers, leads de soporte y operators que necesitan ponerse al día rápido sin leer cada mensaje. Es más fuerte con acceso al conector Slack y permisos de threads; es limitado cuando el asistente sólo ve extractos parciales pegados.
