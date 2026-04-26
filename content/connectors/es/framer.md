---
name: Framer
logo: /connectors/framer.svg
category: productivity
status: available
simpleTitle: "Tu IA edita Framer mientras vos diseñás"
simpleSubtitle: "Cambios de texto, breakpoints y CMS — pedidos por chat, aplicados en el canvas."
devTitle: "Framer MCP Connector"
devSubtitle: "Plugin API + CMS bridge — read components, push CMS rows, trigger publishes."
ctaUrl: "https://www.framer.com/"
affiliate: false
tagline: "Diseñá hablando, no clickeando"
---

Framer es rápido para diseñar, pero los cambios chicos (corregir copy en 12 breakpoints, sincronizar el CMS, exportar componentes) te sacan del flow.

Con este conector, le pedís a Claude *"hacé que el hero diga 'Tu Claude Code, sincronizado' en mobile y tablet, y subí los 3 posts del blog que están en el draft de Notion"* — y él lo aplica en tu proyecto Framer.

Configurás una vez, viaja contigo a cualquier máquina vía Terminal Sync.

--- dev ---

The Framer Plugin API exposes the canvas (components, breakpoints, text nodes) and the Framer CMS exposes collections and items. The community MCP wrapper bridges both into tools Claude Code can call: `framer.text.update`, `framer.cms.upsert`, `framer.publish`.

Terminal Sync keeps your Framer API token in the OS Keychain and replicates the `claude_desktop_config.json` snippet across machines. Open Framer on your laptop, then your studio tower — same agent access without re-pasting tokens.

**Best for**: design-eng hybrids who hate context-switching; agencies maintaining Framer sites for clients who want changes via Slack-able prompts.
