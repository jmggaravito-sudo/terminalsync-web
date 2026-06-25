---
name: Airtable
logo: /connectors/airtable.svg
category: database
status: available
simpleTitle: "Your no-code database, in the agent"
simpleSubtitle: "Airtable holds your CRMs, inventory, and trackers — now Claude reads them too."
devTitle: "Airtable MCP Connector"
devSubtitle: "Base + table introspection with read/write to Claude Code."
ctaUrl: "https://www.airtable.com"
tokenHelpUrl: "https://airtable.com/create/tokens"
manifest:
  mcpServers:
    airtable:
      command: npx
      args: ["-y", "airtable-mcp-server"]
      env:
        AIRTABLE_API_KEY: "${SECRET:AIRTABLE_API_KEY}"
affiliate: false
tagline: "CRM + inventory within AI reach"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/airtable-mcp-server/blob/master/LICENSE"
---
**Airtable** is one of the most widely used no-code database tools in the world: looks like a spreadsheet, works like a relational DB. Companies run their CRM, inventory, order tracker, editorial calendar and content pipeline on it — no code required.

With this connector, your AI can read and write any Airtable base you grant access to. Ask *"which clients haven't bought in 60 days?"* and it composes the filterByFormula query, runs it against Airtable, and returns the list. Tell it *"mark order 487 as shipped"* and it updates the record without you opening the app.

### What you can ask

- *"In my 'Clients CRM' base, list the leads in 'Qualified' status with no activity in the last 2 weeks."*
- *"Add a row to the 'Orders' table with client: María García, amount: $450, status: Pending."*
- *"Search 'Inventory' for products with stock under 5 units and send me a reorder summary."*

### What token you need

You need an Airtable **Personal Access Token (PAT)** — replaces the old API keys, with fine-grained control over which bases the agent sees.

1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens).
2. Click "Create new token". Name it something like "Terminal Sync — Claude".
3. **Scopes**: check `data.records:read` and `data.records:write` (also `schema.bases:read` if you want the agent to understand the base structure without you explaining it).
4. **Access**: pick which bases it can see — you can be surgical and give it only "Clients CRM" without touching the rest.
5. Copy the token (you only see it once) and paste it when the Lab asks for `AIRTABLE_API_KEY`. It travels encrypted in your Keychain.

If you work with multiple clients or projects, one PAT per context beats one omnipotent token.

--- dev ---

`airtable-mcp-server` (Adam Jones / @domdomegg) exposes bases, tables, fields and records over the Airtable REST API. Supports `filterByFormula` for server-side queries, batch upserts, and attachments. The PAT defines scope: specific bases + granular scopes (`data.records:read/write`, `schema.bases:read`, `webhook:manage`).

Terminal Sync keeps the token + base IDs in your Keychain, synced encrypted across machines with AES-256-GCM. The bot sub-account only sees what the PAT authorizes.

License: MIT. Source: github.com/domdomegg/airtable-mcp-server.
