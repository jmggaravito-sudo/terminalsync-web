---
name: monday.com
logo: /connectors/monday.svg
category: productivity
status: available
simpleTitle: "Your work board, run by the AI"
simpleSubtitle: "\"What's blocked?\" \"Add the new lead to the sales board\" — your AI reads and updates monday.com."
devTitle: "monday.com MCP Connector"
devSubtitle: "Official monday.com MCP over the API — boards, items, columns, updates."
ctaUrl: "https://monday.com"
tokenHelpUrl: "https://developer.monday.com/api-reference/docs/authentication"
manifest:
  mcpServers:
    monday:
      command: npx
      args: ["-y", "@mondaydotcomorg/monday-api-mcp", "-m", "atp"]
      env:
        monday_token: "${SECRET:MONDAY_TOKEN}"
        NODE_OPTIONS: "--no-node-snapshot"
affiliate: false
tagline: "Boards and items at AI reach"
originalAuthor: "monday.com"
originalAuthorUrl: "https://github.com/mondaycom/monday-ai"
license: "MIT"
licenseUrl: "https://github.com/mondaycom/monday-ai/blob/master/LICENSE"
---
If your business runs on **monday.com** boards — sales pipeline, projects, orders, whatever you track in those colorful columns — this connector lets your AI read them and update them, so the board stays current without you dragging cards around all day.

Ask *"what's blocked on the projects board?"* and it reads the items and their status. Say *"add a lead to the Sales board: María García, source Instagram, status New"* and it creates the item. Ask *"what's overdue?"* and it finds it. Your board becomes something you can just ask.

### What you can ask

- *"On the Sales board, which deals are stuck in 'Negotiation'?"*
- *"Add an item to 'Orders': client León, amount 450, status Pending."*
- *"What items are assigned to me and due this week?"*

### What you need

monday.com connects with an **API token** from your own account:

1. In monday.com, open your **avatar → Administration → Connections → API** (or **Developers**) and copy your personal API token — see the [official guide](https://developer.monday.com/api-reference/docs/authentication).
2. Paste it when the Lab asks for `MONDAY_TOKEN`.

The token is stored encrypted in your Keychain and synced across your machines.

--- dev ---

`@mondaydotcomorg/monday-api-mcp` (published by **monday.com**, official) speaks the monday.com API. It exposes the core work-management surface — boards, items, columns, groups, updates and users — read and write. The connector runs in `atp` (API-tools) mode.

Auth is the `monday_token` env var (a monday.com personal API token). The server sets `NODE_OPTIONS=--no-node-snapshot` per the official config. Terminal Sync maps the token from the `MONDAY_TOKEN` secret in your Keychain.

Terminal Sync keeps the token in your Keychain, synced encrypted across machines with AES-256-GCM. Because create/update tools mutate real board data, the desktop gates those behind a confirmation step.

License: MIT. Source: github.com/mondaycom/monday-ai (packages/monday-api-mcp).
