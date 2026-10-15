---
name: Fintoc
logo: /connectors/fintoc.png
category: automation
markets: ["CL", "MX"]
status: available
simpleTitle: "Ask your Fintoc account about your payments and your money"
simpleSubtitle: "Official Fintoc MCP: payments, recurring billing, bank movements and transfers in Chile and Mexico, over OAuth — no API key to paste."
devTitle: "Fintoc MCP Connector"
devSubtitle: "Official hosted Fintoc MCP (mcp.fintoc.com) — Payments, Billing, Movements, Payouts, Business Accounts, Webhooks and Team over OAuth."
ctaUrl: "https://fintoc.com"
tokenHelpUrl: "https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp"
manifest:
  mcpServers:
    fintoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.fintoc.com"]
affiliate: false
tagline: "Your payments and your bank, within reach of the agent"
originalAuthor: "Fintoc"
originalAuthorUrl: "https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp"
license: "proprietary"
licenseUrl: "https://www.fintoc.com/cl/legal/terminos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:01:37.043Z"
verifiedPackageVersion: null
---
**Fintoc** is the payments and financial-data platform businesses run on in Chile and Mexico: it connects the company's bank accounts, collects through payment links and subscriptions, issues invoices, and moves money over local bank rails. The official Fintoc MCP server gives your agent direct access to all of it with your own account login — no API key pasted into TerminalSync.

Ask *"Show me this week's bank movements for the business account"* and it pulls them straight from your linked account. *"Did the payment from the link I sent the construction company go through?"* has it check your payment intents and checkout sessions. It can also handle the operational side: creating customers, issuing invoices, setting up subscriptions and refunding payments. For every write, the agent shows you what it's about to do and asks for your confirmation before running it — Fintoc itself recommends enabling human confirmation, because some operations move money.

### What you can ask

- *"Show me this week's bank movements for the business account."*
- *"Did the payment from the link I sent the construction company go through?"*
- *"Show me the active subscriptions and which ones failed on the last charge."*
- *"Create a customer for Distribuidora Central and generate a payment link for $250,000 CLP."*
- *"Set up a $1,500 MXN monthly subscription for client García."*
- *"Refund yesterday's payment for the customer who canceled their order."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Fintoc account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Fintoc's login in your browser: you authorize the connection and pick which permissions (scopes) to grant to your session.
3. Approve it with your account — the connector can only see and do what that account and those permissions allow. You need an active Fintoc account with live-mode access. The official guide (published in Spanish) lives at [docs.fintoc.com](https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp).

**Honest note:** this is a server **hosted by Fintoc** (`https://mcp.fintoc.com`), not something that runs on your computer. It operates on your Fintoc account in Chile and Mexico, and what the agent can see or do is bounded by your account's permissions and the scopes you approve. There are operations Fintoc left out on purpose: paying the invoices Fintoc issues to your organization, canceling subscriptions, detaching a subscription's payment method, and changing or removing user roles — those stay in the dashboard. Refunds are available, always with prior confirmation.

--- dev ---

Fintoc publishes an official **remote MCP server** at `https://mcp.fintoc.com` (HTTP transport), documented in its official guide at `docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp` (published in Spanish; the English version of the docs sits behind a login) with connection configs for Claude Code, Cursor, VS Code and ChatGPT. The official Claude Code config is `claude mcp add --transport http fintoc https://mcp.fintoc.com`. Auth is **OAuth with a browser consent screen**: when connecting, you choose which scopes to grant; *"Un token opera solo en modo live"* (a token only operates in live mode), and new scopes (e.g. Team) require reconnecting and re-authorizing. There's also a second, docs-only MCP server at `https://docs.fintoc.com/mcp`.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.fintoc.com
```

Documented MCP tools, verbatim from the official guide:

- `fintoc_tool_search` — *"Busca las operaciones disponibles en el MCP de Fintoc."* (searches the operations available on Fintoc's MCP)
- `fintoc_tool_details` — *"Obtiene los parámetros y permisos de una operación."* (gets an operation's parameters and permissions)
- `fintoc_tool_read` — *"Lee datos de Fintoc."* (reads Fintoc data)
- `fintoc_tool_write` — *"Escribe datos en Fintoc. Algunas operaciones pueden mover plata."* (writes Fintoc data — some operations can move money)
- `fetch_resource` — *"Obtiene un recurso de Fintoc por su ID."* (fetches a Fintoc resource by ID)
- `submit_feedback` — *"Reporta bloqueadores o comportamientos inesperados a Fintoc."* (reports blockers or unexpected behavior to Fintoc)

A deliberately small set, *"sin exponer una herramienta por cada acción"* (without exposing one tool per action): concrete operations are discovered via `fintoc_tool_search`/`fintoc_tool_details` and executed with `fintoc_tool_read`/`fintoc_tool_write`. Documented operations: **Payments** (list and create customers; list payment intents, checkout sessions and payment methods; list, create and cancel refunds), **Billing** (create, finalize and void invoices; list, create and update subscriptions), **your Fintoc invoices**, **Movements** (links, bank accounts and movements), **Payouts**, **Business Accounts** (accounts, statements, entities, account numbers, transfers; creating account numbers), **Webhooks** (list, create and update endpoints), **IP restrictions** and **Team** (users, roles and invitations) — availability varies with your Fintoc products and granted scopes.

**Disclosure:** a hosted (non-local) server that reads **and writes** — the write tool itself warns that *"algunas operaciones pueden mover plata"* (some operations can move money), and Fintoc recommends enabling human confirmation of tools and staying alert to prompt-injection attacks. Deliberately excluded (no tool): paying the invoices Fintoc issues to your organization, canceling a subscription, detaching a subscription's payment method, and changing/removing user roles — those stay dashboard-only. Refunds are the exception (they return money and can be canceled while pending). Requires an active Fintoc account with live-mode access. **This run's smoke test:** unauthenticated `initialize` → 401; `https://mcp.fintoc.com/.well-known/oauth-authorization-server` advertises authorization/token/registration endpoints on `api.fintoc.com`, PKCE `S256` and 26 granular scopes (`payment:manage`, `refund:manage`, `transfer:manage`, `movement:view`, `invoicing_*`, `webhook_endpoint:*`, `organization_user:*`, …) — dynamic client registration, exactly what the `mcp-remote` bridge needs to reach the consent screen.

License: proprietary SaaS terms (Fintoc, `fintoc.com/cl/legal/terminos`). Source: docs.fintoc.com — Fintoc's official MCP guide. Support: mcp@fintoc.com.
