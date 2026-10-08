---
name: Siigo
logo: /connectors/siigo.svg
category: productivity
status: available
simpleTitle: "Ask your Siigo books in plain language"
simpleSubtitle: "\"Which invoices did we issue to this client?\" \"Create this customer.\" — your AI reads and updates your Siigo, and asks you first."
devTitle: "Siigo MCP Connector (community)"
devSubtitle: "MCP over the official Siigo Colombia API — read customers, invoices and products; create customers, products and invoices."
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
If your business in Colombia keeps its books in **Siigo**, this connector lets your AI work with them without you opening the app: look up who a customer is, what you invoiced them, what a product costs and how much stock is left — and, when you ask, create a customer, a product or an invoice. **Looking things up runs on its own; anything that writes to your books asks for your confirmation first.**

Ask *"Show me the invoices we issued to NIT 900123456 this month"* and it lists them with totals and balance. Ask *"Create a customer for ACME SAS, NIT 900123456"* and it prepares the record and waits for your OK before saving it in Siigo.

### What you can ask

- *"List the sales invoices from the last 7 days and tell me the total."*
- *"Find the customer with identification 900123456 and show their contact details."*
- *"What are the active products and their prices?"*
- *"Create a customer for ACME SAS, NIT 900123456, and add the contact Ana Pérez."*
- *"Create the product CONSULTING-HOUR, a service, and then an invoice to ACME for 3 hours — don't send it to the DIAN yet."*

### What you need

Siigo connects with **API credentials** from your own Siigo Nube account:

1. In Siigo Nube, open **Alianzas** in the left menu and press **Mi Credencial API** to get your username and access key ([how Siigo describes it](https://developers.siigo.com/docs/siigoapi/autenticacion/autenticacion)).
2. Paste them when the Lab asks for `SIIGO_USERNAME` and `SIIGO_ACCESS_KEY`. They are saved encrypted in the app's Secrets vault — never typed into the chat.

**Honest disclosure:** this is a **community-built** connector, **not published or endorsed by Siigo**, and it is **beta**: it has been tested against simulated responses, not yet against a live Siigo account. **It writes to your real accounting**, so read each confirmation before accepting it. **Sending an invoice to the DIAN cannot be undone** (it is only corrected with a credit note): the connector creates invoices without sending them and refuses to send one unless you explicitly asked for it. Editing a customer replaces its record in Siigo, so the AI should read it first. It can read and change whatever your API credential can in your company. Every request identifies the software to Siigo with the `Partner-Id` header Siigo requires, and Siigo may temporarily block an API user whose requests mostly fail, so the connector never retries a write blindly.

--- dev ---

`siigo-mcp` is a stdio MCP server (Node ≥ 20) over the official Siigo API at `https://api.siigo.com`. It authenticates with `POST /auth` (`username` + `access_key`), caches the 24-hour Bearer token and renews it 5 minutes early, and sends the mandatory `Partner-Id` header (default `TerminalSync`, overridable with `SIIGO_PARTNER_ID`).

Read tools (`readOnlyHint: true`, run on their own): `list_customers` (`GET /v1/customers`), `list_invoices` (`GET /v1/invoices`), `get_invoice` (`GET /v1/invoices/{id}`), `list_products` (`GET /v1/products`), `get_product` (`GET /v1/products/{id}`). List tools accept `page` and `page_size` (capped at 100) plus the filters Siigo documents.

Write tools (`readOnlyHint: false`, so TerminalSync asks for confirmation): `create_customer` (`POST /v1/customers`), `update_customer` (`PUT /v1/customers/{id}`, declared destructive because Siigo replaces the record), `create_product` (`POST /v1/products`), `create_invoice` (`POST /v1/invoices`). `create_invoice` only sends to the DIAN when both `stamp.send` and `confirm_send_to_dian` are `true`, and accepts `idempotency_key`, forwarded as Siigo's `Idempotency-Key` header (POST only, as Siigo documents). Outside TerminalSync, set `SIIGO_READ_ONLY=1` to remove every write tool.

A `401` triggers one re-authentication and one retry; nothing else is retried, writes included.

License: MIT. Endpoints and parameters: developers.siigo.com/docs/siigoapi.
