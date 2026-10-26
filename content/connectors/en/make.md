---
name: Make
logo: /connectors/make.svg
category: automation
markets: ["US"]
status: available
simpleTitle: "Run and manage your Make automations from the chat"
simpleSubtitle: "Official Make MCP: run scenarios and review scenarios, connections, webhooks and data stores over OAuth — no API key to paste."
devTitle: "Make MCP Connector"
devSubtitle: "Official Make-hosted MCP (mcp.make.com/v2) — scenario runs and automation management over OAuth."
ctaUrl: "https://www.make.com"
tokenHelpUrl: "https://developers.make.com/mcp-server/connect-using-oauth"
manifest:
  mcpServers:
    make:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.make.com/v2"]
affiliate: false
tagline: "Your Make automations, within reach of the agent"
originalAuthor: "Make"
originalAuthorUrl: "https://developers.make.com/mcp-server/make-mcp-server"
license: "proprietary"
licenseUrl: "https://www.make.com/en/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-26T22:41:23.000Z"
verifiedPackageVersion: null
---
**Make** is the visual automation platform many businesses use to connect their apps without writing code: a **scenario** watches for something happening — a new order, a form submission, a new row in a spreadsheet — and then carries out the steps you set up across your tools. The official Make MCP server lets your agent trigger those scenarios and manage your automation setup directly — no API key pasted into TerminalSync, just your own Make account login.

Ask *"Run my 'New order' scenario right now"* and the agent triggers it and brings back the result. Ask *"Show me all my Make scenarios and which ones are active"* and you get the full picture without opening Make. It's built for running your automations on demand and reviewing what's configured: scenarios, the connections they use, the webhooks that feed them and the data stores behind them.

One thing to know, straight from Make's docs: scenario run tools are available to all plans, while the management tools (viewing and changing scenarios, connections, webhooks, data stores, teams and organizations) are available to paid plans.

### What you can ask

- *"Run my 'New order' scenario right now."*
- *"Show me all my Make scenarios and which ones are active."*
- *"List the connections my scenarios use."*
- *"Show me the webhooks my scenarios receive data through."*
- *"Which teams and organizations do I belong to in Make?"*
- *"Add a data store my scenarios can use."*

Before anything that changes your setup — running a scenario or modifying one — your agent asks you to confirm first.

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Make account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Make's login in your browser.
3. Choose your organization and the access you want to grant — Make's docs put it plainly: *"You select scopes when you connect Make MCP server to an MCP client."* The connector can only see and do what those scopes allow. Make's setup guide is at [developers.make.com](https://developers.make.com/mcp-server/make-mcp-server).

**Honest note:** this is a server **hosted by Make** (`https://mcp.make.com/v2`), not something that runs on your computer. Scenarios run inside your Make account, and what the agent can see or change is bounded by the scopes you approve and the permissions your account already has.

--- dev ---

Make publishes an official **remote MCP server** at `https://mcp.make.com/v2` — in its own words, a *"Make-hosted, cloud-based server that runs via stateless Streamable HTTP"* — documented at `developers.make.com/mcp-server/make-mcp-server`. This is the OAuth variant of the endpoint. Make also documents API-key variants bound to an organization's zone (`https://<MAKE_ZONE>/mcp/v2` with `Authorization: Bearer`, or the key embedded in the URL path) — not used here. Auth is OAuth against the user's Make account; scopes are chosen at connect time (*"You select scopes when you connect Make MCP server to an MCP client"*) and *"Scopes determine the tools available."*

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.make.com/v2
```

Tool surface per the official docs — the server grants MCP clients tools that *"Run active and on-demand scenarios"*, *"View and modify scenarios and their related entities, such as connections, webhooks, and data stores"*, and *"View and modify teams and organizations"*. The docs distinguish **scenario run tools** from **management tools**, with the plan boundary verbatim: *"Scenario run tools are available to all plans, and management tools are available to paid plans."* Documented timeouts over OAuth: 25s for scenario runs and 30s for management tools (40s/60s with an API key); after a run-tool timeout the scenario keeps running in Make for up to 40 minutes and returns an `executionId` that can be fetched afterwards — that retrieval requires the `scenarios:read` scope. Generated tool names cap at 56 characters by default (configurable between 32 and 160 via `?maxToolNameLength=`).

Make also publishes `@makehq/mcp-server` on npm (MIT, repo `integromat/make-mcp-server`), but its own docs mark it **"Make Local MCP Server (legacy)"** and recommend the cloud server — this connector ships the hosted one.

License: proprietary SaaS terms (`www.make.com/en/terms`; the legal pages block non-browser clients in this environment — path not confirmed live). Source: developers.make.com/mcp-server/make-mcp-server.
