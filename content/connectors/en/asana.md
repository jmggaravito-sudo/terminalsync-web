---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Manage your Asana tasks in plain language"
simpleSubtitle: "Official Asana server: find tasks, create work, and check project status."
devTitle: "Asana MCP Connector"
devSubtitle: "Official hosted Asana MCP (mcp.asana.com) — Work Graph access over OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Your Asana projects, within reach of the agent"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** is the app your team uses to track tasks, projects, and who's doing what by when. The official Asana connector is a **hosted MCP server** that gives your agent access to your **Work Graph** — the tasks, projects, and sections your account can already see — so you can ask about your work instead of clicking through boards by hand.

Ask *"Find all my incomplete tasks due this week"* and it searches your assigned work. Say *"Create a new task in the Marketing project assigned to me"* and it creates it directly. It's for checking project status, listing sections, catching up on what's pending, and creating or updating work without leaving the chat.

### What you can ask

- *"Find all my incomplete tasks due this week."*
- *"Create a new task in the Marketing project assigned to me."*
- *"List all sections in the Product Launch project."*
- *"Show me the status of the Q2 Planning project."*

Straight from Asana's own examples: the server can generate reports and summaries and surface AI-powered insights across your projects, in addition to reading and creating tasks.

### How you connect

This connector **doesn't ask you to paste any API key**. It uses your own Asana account login:

1. When you enable it, a browser window opens for you to sign in to Asana and authorize access (OAuth).
2. You approve the permissions with your account — the connector can only see and do what that account is allowed to.
3. That's it: no token to copy or renew by hand. Asana's official connection guide is at [developers.asana.com](https://developers.asana.com/docs/using-asanas-mcp-server).

**Honest note:** it's a server **hosted by Asana** (it doesn't run on your computer). Locally you use the `mcp-remote` bridge, which opens the OAuth flow and keeps the connection to `https://mcp.asana.com/v2/mcp`. What the agent can see or create is bounded by your Asana account's permissions — Asana's docs don't publish further detail on server-side data retention beyond that.

--- dev ---

Asana publishes an official **remote/hosted MCP server** at `https://mcp.asana.com/v2/mcp` (Streamable HTTP transport). The official source is `developers.asana.com/docs/using-asanas-mcp-server`. There's no local stdio command: you connect to the hosted URL and bridge it locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

Auth is **OAuth** against the user's Asana account — the client must support OAuth and Streamable HTTP; `mcp-remote` opens the browser for login and there's no secret to inject (that's why the manifest declares no `env`). The docs don't enumerate granular OAuth scopes; access is bounded by what the authenticated account can see in Asana.

The docs point to `tools/list` (an MCP client command) and `https://developers.asana.com/llms.txt` as the source of truth for the exact current tool set rather than a static list on the page. Documented example capabilities: querying incomplete tasks, creating tasks, listing project sections, checking project status, and generating AI-assisted reports/insights over the Work Graph.

**Deprecated endpoint:** an earlier beta server at `https://mcp.asana.com/sse` used Bearer/API-key auth; Asana's docs mark it deprecated with a shutdown date of **05/11/2026** in favor of the v2 OAuth/Streamable-HTTP endpoint used here.

Asana doesn't publish an open-source repo or LICENSE file for this server (it's a hosted product, not redistributed code) — treated as proprietary SaaS terms, same pattern as Zapier/Ideogram in this catalog. Source: developers.asana.com.
