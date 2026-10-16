---
name: PayPal
logo: /connectors/paypal.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Ask your PayPal account how your money is doing"
simpleSubtitle: "Official PayPal MCP: transactions, invoices, disputes and subscriptions over OAuth — no API key to paste."
devTitle: "PayPal MCP Connector"
devSubtitle: "Official hosted PayPal MCP (mcp.paypal.com/sse) — invoices, orders, refunds, disputes and subscriptions through OAuth."
ctaUrl: "https://www.paypal.com"
tokenHelpUrl: "https://developer.paypal.com/tools/mcp-server/"
manifest:
  mcpServers:
    paypal:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.paypal.com/sse"]
affiliate: false
tagline: "Your PayPal payments and invoices, within reach of the agent"
originalAuthor: "PayPal (PayPal Holdings, Inc.)"
originalAuthorUrl: "https://developer.paypal.com/tools/mcp-server/"
license: "proprietary"
licenseUrl: "https://www.paypal.com/legalhub/useragreement-full"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:40:27.000Z"
verifiedPackageVersion: null
---
**PayPal** is one of the most widely used ways for businesses to send and receive money — PayPal itself says it serves businesses in nearly 200 markets. The official PayPal MCP server connects your agent straight to your merchant account: transactions, invoices, disputes, subscriptions and more, using your own PayPal login — no API key pasted into TerminalSync.

Ask *"Show me this week's transactions and flag the ones still pending"* and the agent pulls them straight from your account. *"Which invoices are still unpaid?"* has it review your invoice list in seconds. It's built for the questions a business owner actually has: did the money come in, who hasn't paid, what is this dispute about, and who is subscribed to what. And when you ask for something that writes to your account — creating and sending an invoice, sending a payment reminder — the agent shows you what it's about to do and asks for your confirmation first.

### What you can ask

- *"Show me this week's PayPal transactions and flag the ones still pending."*
- *"Which invoices are still unpaid? Send a reminder to the client who's late."*
- *"Create a PayPal invoice for $850 for the November retainer and send it to the client."*
- *"Is there any open dispute? Show me the details."*
- *"Show me my active subscriptions and what each one bills."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own PayPal account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens PayPal's login in your browser and asks you to authorize access — PayPal's own docs describe the flow: log into PayPal, then "Authorize the client to work with the MCP server".
3. Approve it with your account — the connector can only see and do what that account is allowed to. The official setup guide is at [developer.paypal.com/tools/mcp-server](https://developer.paypal.com/tools/mcp-server/).

**Honest note:** this is a server **hosted by PayPal** (`https://mcp.paypal.com/sse`), not something that runs on your computer. What the agent can see or do is bounded by what you approve at login with your PayPal account. Some of its tools take real actions on your account — sending invoices, issuing refunds, accepting a dispute claim — so it's worth reading what the agent is about to do before approving. PayPal's MCP documentation doesn't declare plan or country requirements.

--- dev ---

PayPal (PayPal Holdings, Inc.) publishes an official **remote MCP server** at `https://mcp.paypal.com/sse` (SSE), documented at developer.paypal.com/tools/mcp-server/. A Streamable HTTP endpoint (`/http`) is also documented — unauthenticated probes returned 404 in this run, so the manifest pins `/sse`, the endpoint PayPal's own `mcp-remote` setup example (the `paypal-commerce-ai` config) uses. A sandbox server exists at `https://mcp.sandbox.paypal.com`.

Auth is a browser OAuth login: PayPal's docs say the client "sends you to the PayPal login page", you "Log into PayPal" and then "Authorize the client to work with the MCP server". PayPal also documents that *"With remote MCP server, users can continue their tasks across devices with a single login after authentication"*, plus a Bearer alternative using a client ID/secret from the Developer Dashboard. TerminalSync uses the OAuth flow (no secret to paste); per PayPal's troubleshooting docs, the bridge keeps login tokens under `~/.mcp-auth`.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.paypal.com/sse
```

**Smoke (2026-10-16):** `GET /sse` without a token returns 401 (`invalid_token`); `https://mcp.paypal.com/.well-known/oauth-authorization-server` publishes `issuer https://mcp.paypal.com` with `/authorize`, `/token` and `/register` (dynamic client registration), PKCE `S256`, and grants `authorization_code` + `refresh_token`. The `mcp-remote` bridge completed dynamic client registration and reached PayPal's authorization step (verified with `node scripts/smoke-remote-login.mjs --slugs paypal`; completing the login needs a real PayPal account). `POST /http` unauthenticated returned 404.

Documented tools, verbatim from PayPal's official agent-tools catalog (May 2026):

- **Invoices** — `create_invoice`, `list_invoices`, `get_invoice`, `send_invoice`, `send_invoice_reminder`, `cancel_sent_invoice`, `generate_invoice_qr_code`
- **Payments** — `create_order`, `get_order`, `pay_order`, `create_refund`, `get_refund`
- **Disputes** — `list_disputes`, `get_dispute`, `accept_dispute_claim`
- **Catalog** — `create_product`, `list_product`, `show_product_details`
- **Subscriptions** — `create_subscription`, `create_subscription_plan`, `list_subscription_plans`, `show_subscription_details`, `show_subscription_plan_details`, `update_subscription`, `cancel_subscription`
- **Reporting** — `get_merchant_insights`, `list_transaction`
- **Shipment tracking** — `create_shipment_tracking`, `get_shipment_tracking`, `update_shipment_tracking`
- **Remote-only (commerce)** — `search_product`, `create_cart`, `checkout_cart`; per PayPal these currently cover gift cards only and require the header `x-feature-flags: commerce:true` against `https://mcp.paypal.com/sse`

**Disclosure:** this is a server **hosted by PayPal**, not something that runs on your computer. It reads **and writes** through your account — sending invoices, issuing refunds, accepting dispute claims and creating/cancelling subscriptions are real actions; the agent's reach is bounded by what you approve at login. PayPal's MCP docs don't declare plan or country requirements. PayPal also ships a local variant (`npx @paypal/mcp`, repo github.com/paypal/paypal-mcp-server, Apache-2.0) that takes a short-lived `PAYPAL_ACCESS_TOKEN` (*"Valid for 8 hours"* in production, 3–8 hours in sandbox) — that re-pasting burden is exactly what the hosted OAuth flow avoids, and why this connector ships the remote server.

License: proprietary SaaS terms (paypal.com/legalhub/useragreement-full). Source: developer.paypal.com/tools/mcp-server/ and developer.paypal.com/ai-tools/agent-tools/.
