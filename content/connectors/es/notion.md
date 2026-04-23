---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Dale superpoderes a tu asistente con Notion"
simpleSubtitle: "Para que tu IA lea tus recetas, notas y proyectos sin que copies y pegues."
devTitle: "Notion MCP Connector"
devSubtitle: "Expose Notion databases + pages to Claude Code via the Model Context Protocol."
ctaUrl: "https://affiliate.notion.so/REPLACE_WITH_JUANS_NOTION_AFFILIATE"
affiliate: true
tagline: "Que tu IA entienda tu workspace"
---

Tu Notion tiene años de trabajo: recetas, decisiones, links, notas de clientes. Hoy, cuando le pedís algo a Claude, tenés que copiar y pegar el contexto cada vez.

Con el conector de Notion, Claude Code lee tu workspace directamente (con tu permiso) y te responde con base en **tu** conocimiento. Preguntale *"¿qué decidimos con el cliente X el mes pasado?"* y saca la respuesta del doc correcto.

Configurado una sola vez, viaja contigo a todas tus máquinas automáticamente gracias a Terminal Sync.

--- dev ---

Notion's official MCP server exposes databases, pages, and blocks as first-class tools to any MCP-aware client (Claude Code, Cursor, Aider).

Terminal Sync handles the part nobody wants to: syncing your `claude_desktop_config.json` between machines. Set up the Notion MCP once on your laptop — open Claude Code on your studio tower and your queries hit the same workspace without re-configuring.

The API token lives in the OS Keychain via `apiKeyHelper`, encrypted end-to-end in your Drive. Never on disk plaintext, never in the repo.

**Scope**: read databases, read/write pages, query children. Terminal Sync does not touch Notion data — only syncs the config.
