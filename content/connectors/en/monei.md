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
**MONEI** is the payments platform businesses run on in Spain: it's a payment institution regulated by the Banco de España (license #6911), PCI DSS Level 1 certified, and a Bizum Direct Acquirer — which is what lets your customers pay over the local rails Spanish shoppers actually use, like Bizum, card and SEPA — and MB WAY for customers in Portugal. MONEI bills its MCP server as *"the first European payment platform with native AI agent support"*, and it works with any MCP-compatible assistant — including the one in TerminalSync.

Once connected, the agent answers the questions you'd normally open the dashboard for: whether a specific payment came through, which payments failed this week, how much you collected in March and your success rate. It can also do the operational side — create a payment link and send it to a customer by email or SMS. Creating or sending a link changes your real account. Review the requested action and your AI client's approval settings before allowing it; OAuth consent is not a separate confirmation for each action.

### What you can ask

- *"Did the payment from the link I sent the García clinic come through?"*
- *"Show me all the payments that failed this week."*
- *"What was my revenue for March, and what's my success rate?"*
- *"Generate a €50 payment link for order #42 and send it to the customer by email."*
- *"List my active subscriptions and show me the details of the gym client's subscription."*
- *"What payment methods do I have enabled on my account?"*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own MONEI account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens MONEI's login in your browser and asks you to authorize access.
3. Review the actual permissions shown by MONEI before authorizing. Its public repository describes payment and subscription reads, payment-link creation and account reads, but this does not independently certify the permissions of the hosted deployment. Do not approve broader access than you intend. You need an active MONEI account. The official repository is [MONEI/MONEI-MCP-Server](https://github.com/MONEI/MONEI-MCP-Server).

**Honest note:** this server is **hosted by MONEI** (`https://mcp.monei.com`), not on your computer. The public repository describes payment queries and payment-link creation/sending, with restrictions on other operations. TerminalSync has not independently verified those restrictions against an authenticated hosted account. The hosted authorization metadata advertises a broader permission catalog than the four permissions in the repository; supported permissions are not proof of what your account actually grants. Review the consent screen and provider account controls before connecting. The public code is MIT licensed; that alone does not certify the hosted deployment.

--- dev ---

MONEI publishes an official **remote MCP server** (Streamable HTTP) hosted at `https://mcp.monei.com`, documented in its official repo `github.com/MONEI/MONEI-MCP-Server`. One endpoint caveat, verified by direct probe (2026-10-16): the README documents `https://mcp.monei.com/mcp`, but the live hosted deployment serves MCP at the **root** — `POST /mcp` answers 404, while the root answers 401 to an unauthenticated `initialize` and its own `/.well-known/oauth-protected-resource` declares `https://mcp.monei.com` as the resource. The manifest targets the root.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.monei.com
```

Authentication uses **OAuth with browser login**. The public repository describes OAuth 2.0 + PKCE and four permissions (`payments:read`, `payments:create`, `subscriptions:read`, `account:read`); treat this as a description of that code, not a verified limit on the hosted service. The hosted authorization discovery at `oauth.monei.com/.well-known/oauth-authorization-server` advertises dynamic registration and PKCE `S256`, but also a broader scope catalog. Review the actual requested/granted permissions before consenting; this review did not sign in, obtain account tokens or test financial operations.

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

**Security disclosure:** the public repository documents server-side restrictions, audit logging and a per-account rate limit. Those are vendor/code claims, not independently verified runtime guarantees for the hosted endpoint. In particular, this listing does not promise that refunds, captures, cancellations, payouts or settings changes are impossible for every hosted authorization. Do not grant access on that assumption. An unauthenticated check reaching the authorization step verifies reachability only, not granted permissions or enforcement. No account was connected and no financial operation was performed during this review.

License: MIT (repo `LICENSE`, "© MONEI"). Source: github.com/MONEI/MONEI-MCP-Server — official MONEI MCP Server README. Vendor: MONEI Digital Payments, S.L. (Banco de España license #6911).
