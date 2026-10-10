---
name: Mercado Pago
logo: /connectors/mercado-pago.svg
category: automation
status: available
simpleTitle: "Ask your Mercado Pago account what got paid"
simpleSubtitle: "Official Mercado Pago MCP: search payments and orders, review notifications, over OAuth — no API key to paste."
devTitle: "Mercado Pago MCP Connector"
devSubtitle: "Official hosted Mercado Pago MCP (mcp.mercadopago.com) — payment and order lookup, notifications and integration tooling over OAuth."
ctaUrl: "https://www.mercadopago.com"
tokenHelpUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace"
manifest:
  mcpServers:
    mercado-pago:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.mercadopago.com/mcp"]
affiliate: false
tagline: "Your Mercado Pago payments, within reach of the agent"
originalAuthor: "Mercado Pago (MercadoLibre S.R.L.)"
originalAuthorUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace"
license: "Apache-2.0"
licenseUrl: "https://github.com/mercadopago/mercadopago-claude-marketplace/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:17:04.622Z"
verifiedPackageVersion: null
---
**Mercado Pago** is the payments platform of Mercado Libre and one of the main ways businesses get paid across Latin America — present in Argentina, Brazil, Mexico, Chile, Colombia, Peru and Uruguay. The official Mercado Pago MCP server gives your agent direct access to the payments and orders moving through your account, using your own Mercado Pago login — no API key pasted into TerminalSync.

Ask *"Did the payment for yesterday's order come through?"* and the agent searches your payments and brings back the answer. *"What's the status of order 1234?"* and it reads the order straight from your account. *"Show me today's payment notifications"* has it review the notifications history to tell you what Mercado Pago has been reporting. Beyond the lookups, the server also carries the tools Mercado Pago built for integrating payments into an app or website — webhooks, applications, credentials, test users, quality checks — which someone technical on your team can use through the same connection.

### What you can ask

- *"Did the payment for yesterday's order come through?"*
- *"What's the status of order 1234567890?"*
- *"Show me today's payment notifications."*
- *"Search this week's payments and tell me which ones are still pending."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Mercado Pago account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Mercado Pago's login in your browser and asks you to authorize access.
3. Approve it with your account — the connector can only see and do what that account is allowed to. The official docs live at [github.com/mercadopago/mercadopago-claude-marketplace](https://github.com/mercadopago/mercadopago-claude-marketplace).

**Honest note:** this is a server **hosted by Mercado Pago** (`https://mcp.mercadopago.com/mcp`), not something that runs on your computer. What the agent can see or do is bounded by your Mercado Pago account's permissions. The official toolkit that publishes this server is marked **Beta** by Mercado Pago — under active development, with interfaces that may change between versions. And it's worth being clear about what it's for: the documented tools look up payments and orders, review notifications and manage the integration side (applications, webhooks, test users, quality checks) — the server's documented tools don't include charging, refunding or moving real money.

--- dev ---

Mercado Pago (MercadoLibre S.R.L.) publishes an official **remote MCP server** at `https://mcp.mercadopago.com/mcp`, documented in its official GitHub org through the repo of the official Claude Code plugin (`github.com/mercadopago/mercadopago-claude-marketplace` — README plus `plugins/mercadopago/.mcp.json`, which declares the server as `"type": "http"` at that URL). Auth is OAuth: *"No Access Token or keychain setup is required — the MCP server handles authentication via OAuth."* The README also notes the server *"is remote and does not require a local Node.js server"*, and lists 7 supported countries: Argentina, Brazil, Mexico, Chile, Colombia, Peru, Uruguay.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.mercadopago.com/mcp
```

**Smoke (2026-10-10):** an unauthenticated `initialize` returns 401; `https://mcp.mercadopago.com/.well-known/oauth-authorization-server` advertises a `registration_endpoint` (dynamic client registration, PKCE `S256`, public client), and the `mcp-remote` bridge completed dynamic client registration and reached Mercado Pago's authorization screen (`auth.mercadopago.com/mcp/authorization`). Completing the login needs a real account, so the flow was verified up to the consent screen — unlike `zoom`, whose OAuth server has no dynamic client registration, this login is reachable by the bridge.

Documented MCP tools, verbatim from the README's "When MCP connection is required" table:

- `search_payments`, `get_payment`, `get_order` — search or verify a payment/order
- `save_webhook`, `notifications_history` — register or diagnose webhooks
- `application_list`, `get_credentials` — list applications or import credentials; `create_application` — create an application
- `search_documentation` — fill gaps not covered by the official `llms.txt` or bundled references
- `create_test_user`, `add_money_test_user` — create or fund test users
- `quality_checklist`, `quality_evaluation`, `form_homologation` — run official quality checks or homologation
- `authenticate`, `complete_authentication` — OAuth bootstrap only, "not used as pre-flight checks"

**Disclosure:** the repo is marked **Beta** (*"This project is under active development. APIs, skill structures, and plugin interfaces may change between versions. Use in production integrations at your own discretion."*). The integration wizard and skills (Checkout Pro, Bricks, QR, Point, Subscriptions…) belong to Mercado Pago's Claude Code plugin, not to this MCP server — the server surface is the tool list above. Product availability *"still depends on country, account eligibility, commercial enablement, and the selected API."*

License: Apache-2.0 (repo NOTICE — "Copyright (c) 2026 Mercado Pago (MercadoLibre S.R.L.)"). Source: github.com/mercadopago/mercadopago-claude-marketplace.
