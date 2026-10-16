---
name: Tiendanube
logo: /connectors/tiendanube.png
category: automation
markets: ["AR", "MX", "CL", "CO", "BR"]
status: available
simpleTitle: "Ask your Tiendanube store what's selling and what's running out"
simpleSubtitle: "Official Tiendanube MCP: products, stock, orders, customers, coupons and promotions over OAuth — no API key to paste."
devTitle: "Tiendanube MCP Connector"
devSubtitle: "Official hosted Tiendanube/Nuvemshop MCP (admin-mcp.tiendanube.com) — catalog, stock, orders, coupons and promotions over OAuth."
ctaUrl: "https://www.tiendanube.com"
tokenHelpUrl: "https://nuvemshop.dev/ai-agents/admin-mcp"
manifest:
  mcpServers:
    tiendanube:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://admin-mcp.tiendanube.com/mcp"]
affiliate: false
tagline: "Your Tiendanube store, within reach of the agent"
originalAuthor: "Tiendanube (Nuvemshop)"
originalAuthorUrl: "https://nuvemshop.dev/ai-agents/admin-mcp"
license: "proprietary"
licenseUrl: "https://www.tiendanube.com/terminos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:18:23.125Z"
verifiedPackageVersion: null
---
**Tiendanube** is the e-commerce platform businesses across Latin America use to run their online store: catalog, orders, customers and promotions in one place. It operates as Tiendanube in Argentina, Mexico, Chile and Colombia, and as Nuvemshop in Brazil. The official Tiendanube MCP server gives your agent direct access to your store's admin — no API key pasted into TerminalSync, just the login of your own store account.

Ask *"Show me the orders from the last 7 days"* and the agent pulls them straight from your store. Ask *"Create a WELCOME10 coupon with 10% off"* and the coupon is live without opening the admin panel. Beyond lookups, the connector creates and updates products, adjusts prices and stock in bulk, publishes or unpublishes products, organizes categories, sets up promotions (free shipping included) and goes through your customers — always against your store's real data.

### What you can ask

- *"Show me the orders from the last 7 days and tell me which ones are still unpaid."*
- *"Which products do I have left with fewer than 5 units in stock?"*
- *"Update the stock of product 45678 to 100 units."*
- *"Create a WELCOME10 coupon with 10% off for a customer's first purchase."*
- *"Which promotions are active right now, and which ones offer free shipping?"*

Actions that change your store — creating a coupon, updating stock, publishing products — go through a confirmation step: the AI shows you what it's about to do and waits for your approval before running it.

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your store account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Tiendanube's login in your browser and asks you to authorize access to your store.
3. Approve it with your account — one connection maps to a single store, and the connector can only see and do what that account is allowed to. The official guide lives at [nuvemshop.dev](https://nuvemshop.dev/ai-agents/admin-mcp).

**Brazilian stores:** in Brazil the platform operates as Nuvemshop, with its own address for the same server, in Portuguese. The catalog connector ships the Tiendanube address; the Nuvemshop one is documented in the technical section below.

**Honest note:** this is a **server hosted by Tiendanube** (`https://admin-mcp.tiendanube.com/mcp`), not something that runs on your computer. What the agent can see or change is bounded by your store account's permissions. The server manages store data — catalog, stock, orders, customers, coupons, promotions, payment and shipping methods — and it also includes tools that delete (products, categories, coupons, promotions): those deletions are irreversible, and the documentation itself recommends deactivating instead of deleting when you might need something again. Usage is capped at 200 calls per minute per store.

--- dev ---

Tiendanube (Nuvemshop in Brazil) publishes an **official remote MCP server**, the Admin MCP, on its developer portal ([nuvemshop.dev/ai-agents/admin-mcp](https://nuvemshop.dev/ai-agents/admin-mcp); overview at [/ai-agents/mcps](https://nuvemshop.dev/ai-agents/mcps)). Each brand has its own endpoint, with identical tools:

- Tiendanube (Argentina, Mexico, Chile, Colombia; default language es): `https://admin-mcp.tiendanube.com/mcp`
- Nuvemshop (Brazil; default language pt-BR): `https://admin-mcp.nuvemshop.com.br/mcp`

The catalog manifest uses the Tiendanube endpoint. The official docs state the server works with generic MCP clients (it also ships as a ChatGPT app). Auth is OAuth with the store account login: *"The connection uses OAuth: sign in with the store account and authorize access."* Each connection is bound to a single store (*"One connection = one store"*): the URL carries no store identifier — the authorization determines which store each connection operates on.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://admin-mcp.tiendanube.com/mcp
```

**Smoke (2026-10-15):** the `mcp-remote` bridge reached the authorization screen against `admin-mcp.tiendanube.com` (the server answers 401 without credentials). The endpoint publishes `/.well-known/oauth-authorization-server` with dynamic client registration (`/register`, PKCE `S256`) and per-data-group scopes (`read_products`, `write_orders`, `read_customers`, `read_coupons`, `write_shipping`…); the twin Nuvemshop endpoint publishes the same discovery. Completing the login needs a real store account, so the flow was verified up to the consent screen.

There are 28 tools in six groups; the docs type each one's behavior (read / write / destructive):

- **Products:** `search_products`, `list_products` (read); `create_product` (1 product per call), `update_product`, `update_stock_and_price` (up to 50 variants), `update_visibility` (up to 20 products) (write); `delete_product`, `bulk_delete_products` (up to 20) (destructive).
- **Categories:** `list_categories` (read); `create_category`, `assign_categories`, `update_category_visibility` (write); `delete_category` (destructive, deletes subcategories recursively).
- **Orders and customers:** `list_orders` (filters by status, payment, fulfillment, customer, number and date), `list_customers` (read).
- **Coupons:** `list_coupons`, `get_coupon_details` (read); `create_coupon` (percentage, fixed amount or free shipping; `first_consumer_purchase` field for first purchases), `update_coupon` (deactivates with `valid=false`) (write); `delete_coupon` (destructive).
- **Promotions:** `get_promotions`, `get_free_shipping_promotions`, `get_promotions_by_products` (read); `create_promotion` (automatic, no code), `update_promotion` (activates/deactivates via `published`) (write); `delete_promotion` (destructive).
- **Payment and shipping:** `get_payment_methods`, `get_shipping_methods` (read; the latter can compute real costs and delivery estimates from cart data).

**Limits (documented):** 200 tool calls per store within a rolling 60-second window (counts `tools/call`, not `tools/list`; connections sharing a store share the counter). Per-operation maximums: `create_product` 1 product — *"Admin MCP does not expose a bulk product creation tool"* —, `update_stock_and_price` 50 variants, `update_visibility` and `bulk_delete_products` 20 products, `list_products` 50 per page, `search_products` 10–20 results. The docs warn against reading the limit as a guaranteed capacity to create 200 products per minute.

**Disclosure:** hosted server that reads and writes real store data; the `delete_*` tools are irreversible and the docs recommend deactivating coupons (`valid=false`) and promotions (`published=false`) instead of deleting them. The official Storefront MCP (per store, `https://<store-domain>/api/mcp`) is a separate server for buyer-side actions and is not part of this connector. The page mentions no plan requirements.

License: proprietary SaaS terms (`tiendanube.com/terminos`). Source: nuvemshop.dev/ai-agents/admin-mcp.
