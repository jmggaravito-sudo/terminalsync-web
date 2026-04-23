---
name: Make
logo: /connectors/make.svg
category: automation
status: available
simpleTitle: "Que tu IA dispare automatizaciones por vos"
simpleSubtitle: "Decile a Claude lo que necesitás y él arma el workflow en Make sin que toques nada."
devTitle: "Make Automation Hub MCP"
devSubtitle: "Trigger Make scenarios + build new ones from natural language."
ctaUrl: "https://www.make.com/en/register?pc=REPLACE_WITH_JUANS_MAKE_AFFILIATE"
affiliate: true
tagline: "Automatiza hablando, no clickeando"
---

Make (antes Integromat) conecta tus apps sin código: Slack, Gmail, Notion, Stripe, WhatsApp, todo. Pero armar un scenario desde cero te toma 20 minutos de drag-and-drop.

Con este conector, le decís a Claude *"cada vez que llegue un pago en Stripe, mandame WhatsApp y agregá una fila en mi Google Sheet"* y él arma el scenario en Make automáticamente. Vos revisás, le das run, y listo.

--- dev ---

Make's MCP integration uses their REST API to list scenarios, trigger runs, and programmatically create/modify scenario blueprints. Claude gets tool access to the full catalog of 2000+ integrations via Make's module registry.

Terminal Sync ensures the Make API key (scoped to your team) rides in your Keychain, synced across machines via encrypted `claude_desktop_config.json`. Switch from laptop to studio tower — your agent keeps access to the same Make workspace without re-auth.

**Best for**: non-dev users who want to ship automations via conversation. Devs get: programmatic scenario creation, bulk scenario updates, on-demand scenario runs from within the IDE.
