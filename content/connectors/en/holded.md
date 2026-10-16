---
name: Holded
logo: /connectors/holded.png
category: automation
markets: ["ES", "US"]
status: available
simpleTitle: "Ask your Holded account about invoices, stock and clients"
simpleSubtitle: "Official Holded MCP: invoicing, accounting, CRM and inventory over OAuth — no API key to paste."
devTitle: "Holded MCP Connector"
devSubtitle: "Official hosted Holded MCP (mcp.holded.com) — invoices, accounting, CRM, inventory and projects over OAuth."
ctaUrl: "https://www.holded.com"
tokenHelpUrl: "https://help.holded.com/en/articles/15646468-connect-holded-with-ia"
manifest:
  mcpServers:
    holded:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.holded.com/mcp"]
affiliate: false
tagline: "Your Holded business management, within reach of the agent"
originalAuthor: "Holded"
originalAuthorUrl: "https://help.holded.com/en/articles/15646468-connect-holded-with-ia"
license: "proprietary"
licenseUrl: "https://www.holded.com/tac"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 360
aiReadOnlyTools: 151
verifiedAt: "2026-10-16T10:38:51.524Z"
verifiedPackageVersion: null
---
**Holded** is the business management platform many Spanish small businesses run their day-to-day on: invoicing, accounting, CRM, inventory, projects and team, with Spanish tax compliance (Veri*Factu, AEAT) built in and SII and TicketBAI as add-ons. The official Holded MCP server gives your agent direct access to that data — no API key pasted into TerminalSync, just your own Holded account login.

Ask *"Show me this month's unpaid invoices"* and the agent pulls them straight from your account. Ask it to put together a quote and it's ready as a draft for you to turn into an invoice. You can query and summarize invoices, quotes, receipts, contacts, products, stock, warehouses, expenses and purchases — and in the operational areas it can also create and update: contacts, CRM opportunities, quotes and pro forma invoices as drafts, projects, inventory, and documents uploaded to the inbox.

### What you can ask

- *"Show me this month's unpaid invoices and what the total adds up to."*
- *"Which products are down to fewer than 10 units in the warehouse?"*
- *"Summarize last quarter's sales and compare them with the previous quarter."*
- *"Draft a quote for client García S.L. for €1,500."*
- *"Update the phone number and email for client García S.L."*
- *"Add this supplier invoice to the inbox and tag it as 'office expenses'."*

The last three need the **Operational** profile; with Analytical (the preselected one) the AI is read-only. Actions that change your data — drafting a quote, updating a contact, uploading a document — always ask first: the AI shows you what it's about to do and waits for your approval. As Holded itself puts it: *"The AI drafts and organizes; you issue and collect."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Holded account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Holded's login in your browser and asks you to authorize access.
3. Approve it with your account — Holded automatically creates an access token with exactly the permissions you granted, which you can review in your account under **Developers → Credentials**. Holded's own setup guide is at [help.holded.com](https://help.holded.com/en/articles/15646468-connect-holded-with-ia).

**Requirement:** your Holded account needs API access enabled. Holded's API is available on all paid plans, not on the Free plan.

**Honest note:** this is a server **hosted by Holded** (`https://mcp.holded.com/mcp`), not something that runs on your computer. When you authorize, you pick a permission profile: **Analytical** (read-only, the preselected one) or **Operational** (adds write access for operational tasks). Accounting (journal entries, remittances, taxes, payments, payroll), invoices and tax documents, Team/HR, settings and digital signature are **always read-only under Holded's profiles**: the AI can query them, never modify them. And you can't grant the AI a permission you don't have yourself — the agent is bounded by what your user can do in Holded.

--- dev ---

Holded publishes an official **remote MCP server** at `https://mcp.holded.com/mcp`, documented in its help center ([help.holded.com/en/articles/15646468-connect-holded-with-ia](https://help.holded.com/en/articles/15646468-connect-holded-with-ia)). Auth is OAuth with a browser login, no config files: on connecting, Holded automatically creates an access token with exactly the permissions granted during authorization (reviewable under Developers → Credentials).

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.holded.com/mcp
```

**Smoke (2026-10-16):** the endpoint answers 401 without credentials and publishes `/.well-known/oauth-authorization-server` (issuer `app.holded.com`) with a dynamic client registration endpoint (`/api/v2/mcp/oauth/register`) and PKCE `S256` — the `mcp-remote` bridge can register its client and reach the authorization screen. Completing the login requires a real Holded account.

**Permission profiles (from the official docs):**

- **Analytical** — read-only, preselected and recommended. By default it excludes the most sensitive areas: developer tokens, payroll, and bank mandates/remittances (they can be added manually).
- **Operational** — adds write capability, but only for operational, reversible tasks, with confirmation prompts.
- Custom modes also exist: a global permission level (none / read-only / read-write) or per-area settings.

Read-write areas (Operational profile): contacts; CRM and pipeline (opportunities, events, funnels, bookings, activities); quotes and pro forma invoices (as drafts the user converts to invoices); projects; operational inventory (products, warehouses, sales and purchase orders, shipments, production orders); and Inbox document uploads with tags.

Areas that are **read-only under the recommended profiles**: accounting (journal entries, remittances, taxes/AEAT, payments, payroll); invoices and tax documents (invoices, receipts, SII, e-invoicing, POS); Team/HR; settings and system administration; developer tools; digital signature and billing. With a custom per-area permission, Holded lets you enable write access for a single area at your own responsibility — something the docs advise against because of the risk involved.

The developer docs publish a static tool reference (`holded.com/developers/mcp/tools`): **360 tools**, one for each Holded API operation, grouped by area (Sales, Contacts, Accounting, Treasury, CRM, Projects, Inventory, Team & HR, Calendar, Inbox, Developers) with access marked per tool: 151 read-only and 209 write. The help center article doesn't list the tools; it points to the full OpenAPI specification of the Holded API (`api.holded.com/openapi/es.json`).

**Disclosure:** hosted server that reads and — under the Operational profile — writes to operational areas; anything touching money, taxes or people stays read-only under the recommended profiles. Documented requirement: a Holded account with API access enabled — available on all paid plans, not on Free; API usage has a monthly call cap that depends on the plan (holded.com/es/desarrolladores/limite-de-tasa).

License: proprietary SaaS (terms and conditions, `holded.com/tac`). Source: help.holded.com/en/articles/15646468-connect-holded-with-ia.
