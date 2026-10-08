---
name: Siigo
logo: /connectors/siigo.svg
category: productivity
status: available
simpleTitle: "Ask your Siigo books in plain language"
simpleSubtitle: "\"Which invoices did we issue to this client?\" \"Do we have stock of this product?\" — your AI reads your Siigo."
devTitle: "Siigo MCP Connector (community)"
devSubtitle: "Read-only MCP over the official Siigo Colombia API — customers, sales invoices, products and services."
ctaUrl: "https://www.siigo.com"
tokenHelpUrl: "https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion"
manifest:
  mcpServers:
    siigo:
      command: npx
      args: ["-y", "siigo-mcp"]
      env:
        SIIGO_USERNAME: "${SECRET:SIIGO_USERNAME}"
        SIIGO_ACCESS_KEY: "${SECRET:SIIGO_ACCESS_KEY}"
affiliate: false
tagline: "Your Siigo invoices and customers, one question away"
originalAuthor: "Juan Manuel Garavito (community build, not by Siigo)"
originalAuthorUrl: "https://developers.siigo.com/docs/siigoapi/"
license: "MIT"
marketplaceSource: "community"
---
If your business in Colombia keeps its books in **Siigo**, this connector lets your AI look things up without you opening the app: who a customer is, what you invoiced them, what a product costs and how much stock is left. It is **read-only** — it cannot create, edit or cancel anything.

Ask *"Show me the invoices we issued to NIT 900123456 this month"* and it lists them with totals and balance. Ask *"What is the price and stock of product X?"* and it reads it from your catalog. Ask *"Which customers were created last week?"* and it filters by date.

### What you can ask

- *"List the sales invoices from the last 7 days and tell me the total."*
- *"Find the customer with identification 900123456 and show their contact details."*
- *"What are the active products and their prices?"*
- *"Open invoice FV-1-123 and tell me what is still unpaid."*

### What you need

Siigo connects with **API credentials** from your own Siigo Nube account:

1. In Siigo Nube, open **Alianzas** in the left menu and press **Mi Credencial API** to get your username and access key ([how Siigo describes it](https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion)).
2. Paste them when the Lab asks for `SIIGO_USERNAME` and `SIIGO_ACCESS_KEY`. They are stored encrypted in your Keychain — never typed into the chat.

**Honest disclosure:** this is a **community-built** connector, **not published or endorsed by Siigo**, and it is **beta**: it has been tested against simulated responses, not yet against a live Siigo account. Every request identifies the software to Siigo with the `Partner-Id` header Siigo requires. Siigo may temporarily block an API user whose requests mostly fail, so the connector never retries blindly. It can read whatever your API credential can read in your company.

--- dev ---

`siigo-mcp` is a stdio MCP server (Node ≥ 20) over the official Siigo API at `https://api.siigo.com`. It authenticates with `POST /auth` (`username` + `access_key`), caches the 24-hour Bearer token and renews it 5 minutes early, and sends the mandatory `Partner-Id` header (default `TerminalSync`, overridable with `SIIGO_PARTNER_ID`).

Tools (all `readOnlyHint`): `siigo_list_customers` (`GET /v1/customers`), `siigo_list_invoices` (`GET /v1/invoices`), `siigo_get_invoice` (`GET /v1/invoices/{id}`), `siigo_list_products` (`GET /v1/products`), `siigo_get_product` (`GET /v1/products/{id}`). List tools accept `page` and `page_size` (capped at 100) plus the filters Siigo documents.

A `401` triggers one re-authentication and one retry; nothing else is retried.

License: MIT. Endpoints and parameters: developers.siigo.com/docs/siigoapi.
