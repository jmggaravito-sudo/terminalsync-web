---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Que tu IA edite tu sitio sin abrir Webflow"
simpleSubtitle: "Cambios de copy, posts del CMS y publicaciones — pedidos en lenguaje natural."
devTitle: "Webflow MCP Connector"
devSubtitle: "Designer + CMS APIs as tools — query collections, push items, publish staging."
ctaUrl: "https://webflow.com/?utm_source=REPLACE_WITH_JUANS_WEBFLOW_AFFILIATE"
affiliate: true
tagline: "Editá tu sitio hablando"
---

Tu sitio en Webflow tiene 80 posts, 40 productos y un CMS con 12 colecciones. Cada cambio chico te obliga a abrir el editor, esperar que cargue y buscar el ítem correcto.

Con este conector, le decís a Claude *"actualizá el precio del plan Pro a $19, publicá los 3 borradores del blog que están listos y avisame qué se rompió"* y él lo hace contra tus colecciones en segundos.

Una sola configuración, sincronizada en todas tus máquinas: editás desde donde sea sin re-pegar API keys.

--- dev ---

Webflow's Data API exposes Sites, Collections, CMS Items, and the Designer extension surface. The community MCP wrapper turns those into first-class tools — read collections, upsert items, trigger staging publishes, query asset library.

Terminal Sync rides the API token in the OS Keychain (`apiKeyHelper`) and syncs your `claude_desktop_config.json` between machines. The token never lands on disk plaintext and never enters the repo.

**Best for**: agencies running multiple Webflow sites who want bulk CMS edits from the IDE; founders pushing copy changes without opening the visual editor.
