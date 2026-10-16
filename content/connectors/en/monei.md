---
name: MONEI
logo: /connectors/monei.png
category: automation
markets: ["ES"]
status: available
simpleTitle: "Ask your MONEI account what got paid — and collect with payment links"
simpleSubtitle: "Official MONEI MCP: payments, revenue KPIs, subscriptions and payment links over OAuth — no API key to paste."
devTitle: "MONEI MCP Connector"
devSubtitle: "Official hosted MONEI MCP (mcp.monei.com) — payment links, transactions, revenue KPIs, subscriptions and account info over OAuth."
ctaUrl: "https://monei.com"
tokenHelpUrl: "https://github.com/MONEI/MONEI-MCP-Server"
manifest:
  mcpServers:
    monei:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.monei.com"]
affiliate: false
tagline: "Your MONEI payments, within reach of the agent"
originalAuthor: "MONEI Digital Payments, S.L."
originalAuthorUrl: "https://github.com/MONEI/MONEI-MCP-Server"
license: "MIT"
licenseUrl: "https://github.com/MONEI/MONEI-MCP-Server/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:39:26.157Z"
verifiedPackageVersion: null
---
**MONEI** is the payments platform businesses run on in Spain: it's a payment institution regulated by the Banco de España (license #6911), PCI DSS Level 1 certified, and a Bizum Direct Acquirer — which is what lets your customers pay over the local rails Spanish shoppers actually use, like Bizum, card, SEPA and MB WAY. MONEI bills its MCP server as *"the first European payment platform with native AI agent support"*, and it works with any MCP-compatible assistant — including the one in TerminalSync.

Once connected, the agent answers the questions you'd normally open the dashboard for: whether a specific payment came through, which payments failed this week, how much you collected in March and your success rate. It can also do the operational side — create a payment link and send it to a customer by email or SMS. Every write (creating or sending a link) is shown to you first, and the agent asks for your confirmation before running it.

### What you can ask

- *"Did the payment from the link I sent the García clinic come through?"*
- *"Show me all the payments that failed this week."*
- *"What was my revenue for March, and what's my success rate?"*
- *"Generate a €50 payment link for order #42 and send it to the customer by email."*
- *"List my active subscriptions and show me the details of the gym client's one."*
- *"What payment methods do I have enabled on my account?"*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own MONEI account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens MONEI's login in your browser and asks you to authorize access.
3. Approve it with your account — the connector can only see and do what that account allows. MONEI limits the granted permissions to reading payments and subscriptions, creating payment links, and reading your account info. You need an active MONEI account (MONEI serves businesses in Spain and Andorra). The official documentation is at [github.com/MONEI/MONEI-MCP-Server](https://github.com/MONEI/MONEI-MCP-Server).

**Honest note:** this is a server **hosted by MONEI** (`https://mcp.monei.com`), not something that runs on your computer. It reads your payments, subscriptions and account info, and it can create and send payment links — nothing more. Money-moving operations are blocked at the server level, not just hidden: the agent cannot refund payments, capture or cancel them, charge cards or Bizum directly, make payouts, cancel subscriptions, or change your account settings or credentials. Those stay in the MONEI dashboard. Every tool call is audit-logged, and usage is capped at 60 requests per minute per account. It's also a young open-source project (MIT) with its roadmap still open — early-stage, which is worth knowing before you rely on it.

--- dev ---

MONEI publishes an official **remote MCP server** (Streamable HTTP) hosted at `https://mcp.monei.com`, documented in its official repo `github.com/MONEI/MONEI-MCP-Server`. One endpoint caveat, verified by direct probe (2026-10-16): the README documents `https://mcp.monei.com/mcp`, but the live hosted deployment serves MCP at the **root** — `POST /mcp` answers 404, while the root answers 401 to an unauthenticated `initialize` and its own `/.well-known/oauth-protected-resource` declares `https://mcp.monei.com` as the resource. The manifest targets the root.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.monei.com
```

Auth is **OAuth 2.0 + PKCE** (RFC 7636) with single-use state tokens, and tokens are scoped to `payments:read`, `payments:create`, `subscriptions:read`, `account:read` — no API key involved. The vendor's OAuth discovery (`oauth.monei.com/.well-known/oauth-authorization-server`) publishes a `registration_endpoint` (dynamic client registration, PKCE `S256`, and `client_id_metadata_document_supported`), which is what lets `mcp-remote` register its client and reach the browser login.

Documented MCP tools, verbatim from the official README:

| Tool | Type | What it does | README example |
|---|---|---|---|
| `generate_payment_link` | Write | Create a shareable payment URL | *"Generate a €50 link for order #42"* |
| `send_payment_link` | Write | Send link via email or SMS | *"Send that link to alex@example.com"* |
| `get_payment` | Read | Look up a payment by ID | *"What's the status of payment ch_abc123?"* |
| `list_payments` | Read | Search and filter transactions | *"Show me all failed payments this week"* |
| `get_payments_kpi` | Read | Revenue analytics for a date range | *"What's my revenue for March?"* |
| `get_subscription` | Read | View subscription details | *"Get details of subscription sub_xyz"* |
| `list_subscriptions` | Read | Browse subscriptions | *"List all active subscriptions"* |
| `get_account_info` | Read | Account config and payment methods | *"What payment methods do I have enabled?"* |

Payment amounts are in cents (smallest currency unit): €10.50 = 1050.

**Security disclosure:** restricted operations are **hard-blocked at the server level**, not just hidden from the tool list — refunding payments, capturing/canceling payments, charging cards/Bizum directly, card/Bizum payouts, canceling subscriptions, modifying account settings, creating/deleting API keys, and deleting webhooks. A manually crafted call is rejected with a message pointing to `dashboard.monei.com`. Rate limiting is a per-account sliding window of 60 req/min, and every tool call is audit-logged with timestamps, account ID and sanitized parameters. The repo can also be self-hosted (npm/Docker with a MONEI API key) — TerminalSync ships the hosted endpoint. The project is young (12 commits, 0 stars at the time of writing) with an open roadmap (npm publishing, webhook notifications, Bizum-specific tools, settlement reporting). **This run's smoke test:** the `mcp-remote` bridge completed dynamic client registration against `oauth.monei.com` and reached the authorization step on `https://mcp.monei.com` — the login itself needs a human with a MONEI account.

License: MIT (repo `LICENSE`, "© MONEI"). Source: github.com/MONEI/MONEI-MCP-Server — official MONEI MCP Server README. Vendor: MONEI Digital Payments, S.L. (Banco de España license #6911).
