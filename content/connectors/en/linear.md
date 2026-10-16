---
name: Linear
logo: /connectors/linear.svg
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Your issues and projects, handled in plain language"
simpleSubtitle: "Official Linear MCP server: find, create and update issues, projects and comments over OAuth."
devTitle: "Linear MCP Connector"
devSubtitle: "Official hosted Linear MCP (mcp.linear.app/mcp) — issues, projects, comments, with a read-only option."
ctaUrl: "https://linear.app"
tokenHelpUrl: "https://linear.app/docs/mcp"
manifest:
  mcpServers:
    linear:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.linear.app/mcp"]
affiliate: false
tagline: "Your team's plan, within reach of the agent"
originalAuthor: "Linear"
originalAuthorUrl: "https://linear.app/docs/mcp"
license: "proprietary"
licenseUrl: "https://linear.app/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-12T14:38:42.430Z"
verifiedPackageVersion: null
---
**Linear** is the issue and project tracker that product and software teams use to plan their work: issues, projects, cycles and roadmaps in one place. The official Linear connector is a **hosted MCP server** (`https://mcp.linear.app/mcp`), centrally hosted and managed by Linear, that lets your agent find, create and update issues, projects and comments using your own Linear account.

Ask *"What's at risk in the current cycle?"* and it reads your team's issues to summarize the status. Say *"Create a bug for the checkout error and assign it to me"* and it files the issue with the details. It's for the standing questions — what's blocked, what shipped, what's next — without opening the board.

### What you can ask

- *"Summarize what we got done this cycle and what slipped."*
- *"Create a bug issue for the checkout error and assign it to me."*
- *"Find all issues assigned to me that are past due."*
- *"Turn these standup notes into updates on the roadmap project."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Linear account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Linear's OAuth login in your browser — the client registers itself automatically, no manual app setup.
3. Sign in and authorize access. What the agent can see or do is bounded by your own Linear account and workspace.

**Honest note:** this is a **hosted server run by Linear** (`https://mcp.linear.app/mcp`), not something that runs on your computer. By default this connector grants read-write access; Linear also offers a read-only endpoint (`/mcp/readonly`) that only ever exposes read tools.

--- dev ---

Linear publishes its MCP server as a **remote/hosted server**, centrally hosted and managed, documented at `linear.app/docs/mcp`. Endpoints: `https://mcp.linear.app/mcp` (read-write, Streamable HTTP), `https://mcp.linear.app/mcp/readonly` (read-only) and a legacy `/sse` (deprecated). There's no local stdio package — Linear's own docs give the generic-client config, which is exactly the `mcp-remote` bridge:

```
npx -y mcp-remote https://mcp.linear.app/mcp
```

Auth is **OAuth 2.1 with dynamic client registration** — no manual OAuth app. Alternative: pass a token directly via the `Authorization: Bearer <token>` header (OAuth tokens or Linear API keys, e.g. a restricted read-only key); Enterprise workspaces can use Okta-managed authorization.

Tools, per the official docs: *"tools available for finding, creating, and updating objects in Linear like issues, projects, and comments"*, with more planned. Documented use cases include roadmap planning, standup note updates, bug investigation, cycle summarization, timelines and implementation plans.

Read-only options: the `/mcp/readonly` endpoint *"only ever exposes read tools"*; or the standard endpoint with only the `read` OAuth scope — *"Clients that request `read` are granted read-only access"* and the token cannot reach write APIs. A Linear API key with only the `Read` permission enabled works the same way.

License: proprietary SaaS terms (Linear Terms of Service, `linear.app/terms`). Source: linear.app/docs/mcp.
