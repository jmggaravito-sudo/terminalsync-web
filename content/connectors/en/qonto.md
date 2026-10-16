---
name: Qonto
logo: /connectors/qonto.png
category: automation
markets: ["ES", "FR"]
status: available
simpleTitle: "Ask your Qonto account where the money went — and invoice from the chat"
simpleSubtitle: "Official Qonto MCP: transactions, cards, client invoices and payment links over OAuth — no API key to paste."
devTitle: "Qonto MCP Connector"
devSubtitle: "Official hosted Qonto MCP (mcp.qonto.com/mcp) — business banking, invoicing and card management over OAuth."
ctaUrl: "https://qonto.com"
tokenHelpUrl: "https://docs.qonto.com/mcp/overview"
manifest:
  mcpServers:
    qonto:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.qonto.com/mcp"]
affiliate: false
tagline: "Your business account and your invoicing, within reach of the agent"
originalAuthor: "Qonto"
originalAuthorUrl: "https://docs.qonto.com/mcp/overview"
license: "proprietary"
licenseUrl: "https://docs.qonto.com/mcp/terms-and-disclosures"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:39:54.000Z"
verifiedPackageVersion: null
---
**Qonto** is the business account freelancers and small companies run on in Spain and France (and other European countries): cards, transfers, invoicing and day-to-day bookkeeping in one place. The official Qonto MCP server lets your agent read and act on that account directly — no API key to paste into TerminalSync, just your own Qonto login.

Ask *"What did I spend last month?"* and it pulls the transactions from your account. Ask *"Show me what I'm owed"* and it goes through your client invoices to find what's overdue and needs a follow-up. It also handles the operational side: drafting and sending client invoices, creating payment links, locking a card, inviting new teammates. Every write is confirmed with you before it runs, and money-sensitive operations still require your approval in the Qonto mobile app — exactly as if you were doing them yourself.

### What you can ask

- *"What did the business spend last month, and on what?"*
- *"Which client invoices are still unpaid, and how much is overdue?"*
- *"Show me the supplier invoices waiting to be paid."*
- *"Create an invoice for €1,200 for Vega Studio and send it by email."*
- *"Create a payment link for €350 so the client can pay online."*
- *"Lock Ana's card — she lost her wallet."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Qonto login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Qonto's login in your browser: you sign in, pick the organization to connect, and review the permissions the client requests.
3. Approve it with your account — every tool call is authenticated as you, and the connector can never see or do more than your Qonto role and your organization's plan allow. The official guide is at [docs.qonto.com](https://docs.qonto.com/mcp/overview).

**Honest note:** this is a server **hosted by Qonto** (`https://mcp.qonto.com/mcp`), not something that runs on your computer. It's stateless — Qonto says it stores no conversation content or business data, it only relays tool calls, and your AI client holds the conversation. Owners, admins and accountants can connect right away; managers and employees need an owner or admin to enable Qonto MCP for the organization first. Some actions (like creating certain cards) trigger an approval in the Qonto mobile app, and the connector cannot bypass it. Qonto's own terms warn that connecting shares your account data with a third-party AI tool — connect only to tools you trust.

--- dev ---

Qonto publishes an official **remote MCP server** at `https://mcp.qonto.com/mcp` (production), documented at `docs.qonto.com/mcp/overview`. Transport is Streamable HTTP, and Qonto documents the generic-client config verbatim:

```json
{
  "mcpServers": {
    "qonto": {
      "type": "http",
      "url": "https://mcp.qonto.com/mcp"
    }
  }
}
```

Auth is **OAuth with browser login** — *"there is no API key or organization ID to copy by hand"*; the server reuses the same identity provider and consent screen as `developers.qonto.com`, with the same permission catalog as the Business API. Scopes are fixed at consent time; expanding them requires re-authorization. This connector connects **one organization per authorization**; a separate read-only multi-organization endpoint exists at `https://mcp.qonto.com/multi-organization/mcp` (write tools are not exposed there).

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.qonto.com/mcp
```

Tools are grouped by business domain (tool reference: `docs.qonto.com/mcp/tools/overview`). Documented surface, verbatim by domain:

- **Read** — transactions and statements (*"list, filter, retrieve transactions; pull monthly statements with presigned download URLs"*); cards and their metadata; clients; client invoices, supplier invoices, quotes and credit notes; payment links (*"read one together with the payments collected against it"*); pending card and multi-transfer requests; memberships, teams and labels; organization metadata (*"legal name, IBANs, slug"*); the organization's own plan plus Qonto's public price list; attachments.
- **Write** — cards (`create_card`, `update_card`, `change_card_status` — *"Set exactly one of `lock` (reversible), `unlock` (owners and admins only), `lost`, `stolen`, `discard` (all irreversible)"*); card and multi-transfer requests; client invoices (*"create, update, finalize, mark as paid or unpaid, send by email or over the e-invoicing network, delete drafts"*); quotes; credit notes; supplier invoices (*"change status (mark paid, unmark paid, reject)"*); payment links (*"create a shareable checkout page from a basket of items or an existing client invoice"*); products; clients; memberships and teams (*"invite new members (employee or reporting), create teams"*); uploading attachments; cash flow categories (*"grow it, and tag transactions"*).

**Disclosure:** *"Write tools exist only on the standard endpoint"*, and write operations *"always go through Qonto's standard approval logic"* — approving a request happens in the Qonto web app, not through the assistant. SCA: sensitive operations (PSD2-classified actions like creating certain cards) still require Strong Customer Authentication in the Qonto mobile app — *"The MCP server cannot bypass SCA."* Every tool call is *"authenticated as you"* and cannot exceed the user's role or the organization's price plan. Roles: *"Owners, admins, and accountants can connect by default"*; managers and employees once an owner or admin enables Qonto MCP for the organization. Explicitly **not** exposed via MCP: SEPA outgoing transfers to a beneficiary, international transfers, SEPA direct debit mandates/subscriptions/collections, webhooks, terminals, payment-link deactivation and provider connections, and onboarding — the Business API covers those. The server is stateless and *"stores no conversation content or business data"*; the MCP client holds the conversation. Qonto's Terms and Disclosures warn that connecting shares account data with a third-party AI tool, that Qonto *"cannot retrieve or delete information once it has been shared"*, and that *"certain sensitive actions — such as initiating payments — are not available through this connection"*. Access can be revoked anytime in the connected-apps section of the Qonto account. **This run's smoke test:** unauthenticated `initialize` → 401; `https://mcp.qonto.com/.well-known/oauth-authorization-server` → 200 — the endpoint is live and OAuth-gated, exactly what the `mcp-remote` bridge needs to reach the consent screen.

License: proprietary SaaS (Qonto; MCP Terms and Disclosures at `docs.qonto.com/mcp/terms-and-disclosures`, privacy policy at `legal.qonto.com`). Source: docs.qonto.com — Qonto's official MCP documentation.
