---
name: Airtable
logo: /connectors/airtable.svg
category: database
status: available
simpleTitle: "Tu base de datos de no-código, en el agente"
simpleSubtitle: "Airtable guarda tus CRMs, inventarios y trackers — ahora Claude los lee también."
devTitle: "Airtable MCP Connector"
devSubtitle: "Base + table introspection with read/write to Claude Code."
ctaUrl: "https://airtable.com/invite"
affiliate: false
tagline: "CRM + inventario al alcance de la IA"
manifest:
  command: npx
  args: ["-y", "airtable-mcp-server"]
  env:
    AIRTABLE_API_KEY: "${SECRET:AIRTABLE_API_KEY}"
---

Si usás Airtable como CRM, inventario o tracker de pedidos, ahora podés preguntarle a Claude *"¿qué clientes no me han respondido en 2 semanas?"* o *"marcá el pedido 487 como enviado"* sin abrir la app.

--- dev ---

Airtable's MCP server exposes bases, tables, fields, and records. Supports filterByFormula for server-side queries, upserts, and attachments. API key scoped per-base.

Terminal Sync keeps the key + base IDs in your Keychain-backed `claude_desktop_config.json`, synced encrypted across machines.
