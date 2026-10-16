---
name: Conekta
logo: /connectors/conekta.svg
category: automation
markets: ["MX"]
status: soon
simpleTitle: "Ask your Conekta payments in plain language"
simpleSubtitle: "Official Conekta MCP: orders, customers, charges, refunds and subscriptions, with your private API key."
devTitle: "Conekta MCP Connector"
devSubtitle: "Official hosted Conekta MCP (mcp.conekta.com) — orders, customers, charges, refunds, checkouts and subscriptions over Streamable HTTP, Bearer auth with your private API key."
ctaUrl: "https://www.conekta.com"
tokenHelpUrl: "https://panel.conekta.com/developers"
manifest:
  mcpServers:
    conekta:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.conekta.com/mcp", "--header", "Authorization:${CONEKTA_AUTH_HEADER}"]
      env:
        CONEKTA_AUTH_HEADER: "Bearer ${SECRET:CONEKTA_API_KEY}"
affiliate: false
tagline: "Your Conekta payments, within reach of the agent"
originalAuthor: "Conekta"
originalAuthorUrl: "https://github.com/conekta/mcp-server"
license: "proprietary"
licenseUrl: "https://www.conekta.com/legal/tos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:10:05.000Z"
verifiedPackageVersion: null
---
**Conekta** is Mexico's payment gateway: one integration to take cards, SPEI bank transfers and cash payments in Mexican pesos. Its own pitch is *"una sola integración para todo México"* — a single integration for all of Mexico. The official connector is a **hosted MCP server** (`https://mcp.conekta.com/mcp`), published by Conekta, that connects your agent to your account's payment operation — the official docs introduce it as a server for *"cualquier agente de AI o LLM"* (any AI agent or LLM) to work against the Conekta API.

Ask *"Show me today's orders"* — an example straight from the docs — and the agent pulls your orders and summarizes their status. *"What's my available balance?"* comes from your account's balance, no dashboard digging. It also works for you: *"Create a 500-peso payment link"* generates the checkout link, and *"Refund Ana Gómez's latest charge"* processes the refund. The docs' own pitch: use it to *"crear clientes, órdenes y links de pago sin salir de tu flujo de trabajo"* (create customers, orders and payment links without leaving your workflow).

### What you can ask

- *"Show me today's orders and tell me which ones have been paid."*
- *"What's my available balance in Conekta?"*
- *"Create a 500-peso payment link and email it to the customer."*
- *"Refund Ana Gómez's latest charge."*
- *"Pause Ana Gómez's subscription."*
- *"Which subscriptions do I have active, and on what plan?"*

Whenever a request writes to your account — creating an order, refunding a charge, pausing a subscription — the AI shows you what it's about to do and waits for your confirmation before running it.

### What token you need

You need a **Conekta private API key** — the credential that lets software operate on your account. Don't confuse it with the public key: that one only tokenizes cards in the customer's browser and won't work here.

1. Sign in to the [Conekta panel](https://panel.conekta.com/developers) and open the Developers section (left-hand menu) → **Ver API Keys** → **Consultar API Keys de producción** (view production API keys).
2. If this is your first integration, click **Crear nueva llave privada** (create a new private key) and give it an alias. The key is displayed **only once** — copy it right then and keep it somewhere safe. Conekta allows up to 10 private keys in production and another 10 in test.
3. Paste it when TerminalSync asks for `CONEKTA_API_KEY`. It's stored encrypted in the app's Secrets and sent to the server as the `Authorization: Bearer …` header Conekta expects.

Official notes on the key: only Administrator and Developer roles can manage API keys, and if you lose one or suspect it leaked, Conekta recommends generating a new key and reconfiguring the integration (deleted keys can't be recovered).

**Honest disclosure:** this is a **server hosted by Conekta** (`https://mcp.conekta.com`), not something running on your computer — your requests travel to Conekta's server, which answers with data from your account. It **reads and writes**: it can create orders, customers, plans and payment links, refund charges, and pause, cancel or resume subscriptions. What the agent can do is bounded by your private key — the same access your account has through the API — and the MCP docs describe no server-side confirmation step (that confirmation is requested by TerminalSync before every write). The data comes from your Conekta account, and verifying it is your responsibility.

**Why it shows as Coming soon:** while preparing this card (2026-10-15), the server's documented address (`mcp.conekta.com`) was not published in Conekta's DNS, so it can't be connected to yet. The card ships with the official documented configuration and will be enabled once the endpoint answers and we've re-verified it.

--- dev ---

Conekta publishes its **official MCP** at `https://mcp.conekta.com/mcp` — *"available remotely over Streamable HTTP"*, per the README of the official repo (`github.com/conekta/mcp-server`). The repo also ships a local stdio server (Python via `uv`, or Docker `ghcr.io/conekta/mcp-server:latest`, env `CONEKTA_API_KEY`); this card follows the hosted endpoint, bridged with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.conekta.com/mcp --header "Authorization:${CONEKTA_AUTH_HEADER}"
```

**Auth: Bearer with your private key.** The `Authorization` header carries your private API key as a Bearer token. The README is explicit: *"The header must be exactly `Authorization`"*, *"The value must include the `Bearer ` prefix"*, and *"Replace `key_xxx` with your real Conekta private API key."* This card's manifest injects the key from the app's Secrets as `${SECRET:CONEKTA_API_KEY}` inside that header — the `--header` argument carries no spaces around the colon, as the `mcp-remote` README recommends to dodge the escaping bug in some clients.

**Key:** panel.conekta.com → Developers section → **Ver API Keys** → **Consultar API Keys de producción** → **Crear nueva llave privada**. The client config Conekta documents for the hosted endpoint:

```json
{
  "mcpServers": {
    "conekta": {
      "url": "https://mcp.conekta.com/mcp",
      "headers": { "Authorization": "Bearer key_xxx" }
    }
  }
}
```

**Tools by resource** (verbatim names from the README):

- **Balance:** `get_balance`
- **Customers:** `create_customer`, `list_customers`, `get_customer`, `update_customer`
- **Orders:** `create_order`, `list_orders`, `get_order`, `update_order`, `cancel_order`, `capture_order`
- **Charges:** `list_charges`
- **Refunds:** `create_refund`
- **Plans:** `create_plan`, `list_plans`, `get_plan`
- **Subscriptions:** `list_subscriptions`, `get_subscription`, `create_subscription`, `update_subscription`, `cancel_subscription`, `pause_subscription`, `resume_subscription`
- **Checkouts (payment links):** `create_checkout`, `list_checkouts`, `get_checkout`, `cancel_checkout`, `send_checkout_email`, `send_checkout_sms`
- **Events:** `list_events`, `get_event`
- **Company:** `get_current_company`

**Endpoint status (2026-10-15):** `mcp.conekta.com` **does not resolve in DNS** (NXDOMAIN confirmed against Conekta's authoritative Route 53 nameservers, queried via Google and Cloudflare DoH), while sibling subdomains (`www`, `panel`, `developers`, `api`) all resolve. The endpoint is documented verbatim in the official README and on developers.conekta.com, but it cannot be reached today; that's why this card ships as `soon` with `installableForAi: false`. Once DNS answers, re-verify with `node scripts/smoke-remote-login.mjs --slugs conekta` and flip to `status: available` / `installableForAi: true`.

**Disclosure:** a hosted server (not local) that reads and writes against your Conekta account — the catalog includes tools that move real money (`create_refund`, `capture_order`) and tools that modify subscriptions. The MCP docs document no server-side confirmation gate: control stays with the client orchestrating the tools and with the key's permissions. Reach: Conekta is a Mexican gateway — its payment methods are domestic Mexican rails (SPEI, Conekta Efectivo, Meses sin Intereses, among others).

License: proprietary (Conekta SaaS; the `conekta/mcp-server` repo declares no license). Source: developers.conekta.com — "Conekta MCP Server" doc + the official repo README at github.com/conekta/mcp-server (tools and auth verbatim). Terms: conekta.com/legal/tos.
