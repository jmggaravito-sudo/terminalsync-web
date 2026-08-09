---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Ask your Asana projects what's actually going on"
simpleSubtitle: "Official Asana MCP: tasks, projects and status updates over OAuth, no API key to paste."
devTitle: "Asana MCP Connector"
devSubtitle: "Official hosted Asana MCP (mcp.asana.com/v2/mcp) — tasks and project data through OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Your Asana workspace, within reach of the agent"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** is the project and task tracker teams use to keep work organized: who's doing what, by when, and in which project. The official Asana MCP server lets your agent read and manage that workspace directly — no API key pasted into TerminalSync, just your own Asana account login.

Ask *"Find all my incomplete tasks due this week"* and the agent pulls them straight from your workspace. Ask *"Create a new task in the Marketing project assigned to me"* and it's created without opening Asana. It's built for checking status, creating and updating tasks, and understanding what's moving across your projects.

### What you can ask

- *"Find all my incomplete tasks due this week."*
- *"Create a new task in the Marketing project assigned to me."*
- *"List all sections in the Product Launch project."*
- *"Show me the status of the Q2 Planning project."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Asana account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Asana's login in your browser and asks you to authorize access.
3. Approve it with your account — the connector can only see and do what that account is allowed to. Asana's own setup guide is at [developers.asana.com](https://developers.asana.com/docs/using-asanas-mcp-server).

**Honest note:** this is a server **hosted by Asana** (`https://mcp.asana.com/v2/mcp`), not something that runs on your computer. What the agent can see or change is bounded by your Asana workspace permissions.

--- dev ---

Asana publishes an official **remote MCP server (V2)** at `https://mcp.asana.com/v2/mcp`, documented at `developers.asana.com/docs/using-asanas-mcp-server`. The prior beta (`v1`, served at `/sse`) is scheduled by Asana for shutdown on 05/11/2026 — this connector targets V2. Transport is Streamable HTTP; auth is OAuth against the user's Asana account (the docs state: *"This server requires authentication with your Asana account. When connecting, you'll be prompted to authorize the application to access your Asana data."*).

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

Asana's docs don't publish a static tool list on the page; they direct clients to call `tools/list` against the live server to enumerate available tools. Documented example capabilities cover finding/filtering tasks, creating tasks, listing project sections, and checking project status.

License: proprietary SaaS terms (`asana.com/terms`). Source: developers.asana.com/docs/using-asanas-mcp-server.
