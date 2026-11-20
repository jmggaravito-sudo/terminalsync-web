---
name: PandaDoc
logo: /connectors/pandadoc.png
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Your proposals and contracts, created and sent for signature by conversation"
simpleSubtitle: "Official PandaDoc MCP server: build documents from your templates, send them for signature and track their status over OAuth."
devTitle: "PandaDoc MCP Connector"
devSubtitle: "Official hosted PandaDoc MCP (mcp.pandadoc.com) — documents, templates, sending, tracking and e-signature."
ctaUrl: "https://www.pandadoc.com"
tokenHelpUrl: "https://developers.pandadoc.com/docs/getting-started-with-mcp"
manifest:
  mcpServers:
    pandadoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pandadoc.com/v1/mcp"]
affiliate: false
tagline: "The paperwork that closes deals, within reach of the agent"
originalAuthor: "PandaDoc"
originalAuthorUrl: "https://developers.pandadoc.com/docs/getting-started-with-mcp"
license: "MIT"
licenseUrl: "https://github.com/PandaDoc/mcp-server-guide/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-16T14:28:17.460Z"
verifiedPackageVersion: null
---
**PandaDoc** is the platform sales teams use to create proposals, quotes, contracts and agreements, send them out for signature and track every signature. Its official MCP server describes it as: *"PandaDoc MCP server for creating, sending, signing, and tracking PandaDoc documents"*. The connector is a **hosted MCP server** (`https://mcp.pandadoc.com/v1/mcp`), which the official docs frame like this: *"so agents can read, create, and update your PandaDoc documents and templates"*.

What that means day to day: your agent can create documents from your templates (with pricing tables and fields filled in), send them for signature, review what has been signed and what is still waiting, chase the ones running late with reminders, search your documents by customer, amount or date, follow up with summaries and the audit trail, and answer questions like "how long does it take people to sign my proposals?".

### What you can ask

- *"List the 5 most recent documents in my account and show their status."*
- *"Create a sales proposal for Acme Corp using our proposal template, with a pricing table: 3 licenses at $500 each and a 10% discount."*
- *"Which contracts worth more than $100,000 were signed last quarter?"*
- *"Send a reminder for the contracts tagged 'Q4' that haven't been signed yet."*
- *"What's the average time it takes people to sign my proposals?"*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses PandaDoc's sign-in:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens PandaDoc's authorization page in your browser: you approve access (*"Allow access"*) and authorize the connection with your account.
3. Done — once authorization finishes, the agent is connected to your PandaDoc account.

**Honest note:** this is a **server hosted by PandaDoc** (`https://mcp.pandadoc.com/v1/mcp`), not something that runs on your computer, and it takes **real actions on your account**: it sends documents for signature, chases reminders and can update or expire documents — review before approving each send. PandaDoc runs the server in **two regions** and *"each server returns only the documents and templates stored in its own region"*: this connector uses the **global** server; if your account is in the European region (you sign in at `app.pandadoc.eu`), authorization against the global server fails — the technical section explains how to point it at the European server.

--- dev ---

PandaDoc (official GitHub org `PandaDoc`) publishes its MCP server as a **remote/hosted server**, documented at `developers.pandadoc.com/docs/getting-started-with-mcp` (official repo `github.com/PandaDoc/mcp-server-guide`, LICENSE MIT *"Copyright (c) 2026 PandaDoc"*; the hosted server is served as SaaS under PandaDoc's terms). The server is available in **two regions**, official table verbatim:

| Region | MCP server URL |
|---|---|
| Global | `https://mcp.pandadoc.com/v1/mcp` |
| European (pandadoc.EU) | `https://mcp.pandadoc.eu/v1/mcp` |

*"If you sign in at `app.pandadoc.eu`, your account is in the European region and you must use the `mcp.pandadoc.eu` URL. Authentication fails if the region of the server URL doesn't match the region of your account."* The catalog manifest uses the **global** one; for a European account, point the bridge at the European server:

```
npx -y mcp-remote@latest https://mcp.pandadoc.eu/v1/mcp
```

The docs also note that *"There is no PandaDoc connector in the Claude connector directory for the European region"* — in Claude Desktop an EU account is added as a **custom connector** with the URL `mcp.pandadoc.eu/v1/mcp`. Authorization is OAuth with PandaDoc's browser sign-in (the *"Allow access"* → *"Authorize"* flow documented per client); the docs list the supported clients and give steps for Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode, Cline and Windsurf/Devin.

Surface: the official reference does not publish a flat list of MCP tools — it documents it as a **prompt library** ("What You Can Do with PandaDoc MCP", `developers.pandadoc.com/docs/what-you-can-do-with-pandadoc-mcp`), organized into verbatim categories: Document Creation & Template Management (list templates, create documents from a template, upload a PDF as a template, inspect a template's roles/fields/tokens), Document Status & Management (check signature, full details, mark as paid, decline with a note), Bulk Operations & Reminders (documents awaiting signature, expire old drafts, reminders by tag, archive), Document Search & Filtering (full-text search, by expiration, by tag and status, recently modified), Analytics & Reporting (count by status, audit trail *"who viewed it, when, and what actions were taken"*, AI summaries, reports by date range), Document Lifecycle Management (create → review → send, approval workflow), Advanced Document Operations (extract text as markdown, update text blocks, content-library clauses) and Customer-Specific Workflows (documents per customer, reassign sender, multi-party signing). Official examples verbatim: *"Find all contracts worth more than $100,000 that were signed last quarter"*, *"What's the average time to sign proposals in the last month?"*, *"Before sending document doc_abc123, verify it's in draft status and show me its content for a final review"*.

License: MIT (LICENSE of the official repo `PandaDoc/mcp-server-guide`); the hosted server is consumed as PandaDoc's proprietary SaaS. Source: developers.pandadoc.com/docs/getting-started-with-mcp + MCP registry (`com.pandadoc.mcp/mcp`).
