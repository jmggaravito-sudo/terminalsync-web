---
name: Typeform
logo: /connectors/typeform.svg
category: productivity
status: available
simpleTitle: "Tu IA crea y analiza forms por vos"
simpleSubtitle: "Diseñá un form en chat, mirá las respuestas, exportá insights — sin abrir Typeform."
devTitle: "Typeform MCP Connector"
devSubtitle: "Forms, responses and webhooks as tools — build, query and route from the IDE."
ctaUrl: "https://www.typeform.com/?utm_source=REPLACE_WITH_JUANS_TYPEFORM_AFFILIATE"
affiliate: true
tagline: "Forms y respuestas sin clickear"
---

Typeform es lindo, pero armar un form de 12 preguntas con lógica condicional sigue siendo 15 minutos de drag-and-drop. Y cuando llegan las respuestas, abrir el dashboard cada vez para ver patrones es tedioso.

Con este conector, le decís a Claude *"hacé un form de feedback con 5 preguntas, lógica que oculte la última si dicen NPS bajo, y al final mandá el response a mi Notion"* — y él lo crea + setea el webhook.

Configurado una vez, viaja contigo a todas tus máquinas vía Terminal Sync.

--- dev ---

Typeform's Create + Responses APIs expose Forms, Themes, Workspaces, Responses and Webhooks. The community MCP wrapper turns those into tools: `typeform.forms.create`, `typeform.responses.query`, `typeform.webhooks.subscribe`.

Terminal Sync ride el token en el Keychain del OS y replica tu `claude_desktop_config.json` entre máquinas. Cambiás de laptop a torre y los forms, las responses y los webhooks siguen accesibles sin re-pegar API keys.

**Best for**: founders + agencies que arman muchos surveys/onboarding flows; researchers que quieren analizar responses con un agente IA en vez de abrir el dashboard cada vez.
