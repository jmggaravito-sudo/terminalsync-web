---
name: Shopify
logo: /connectors/shopify.svg
category: automation
status: available
simpleTitle: "Ask your AI about your Shopify store"
simpleSubtitle: "A first-party Terminal Sync connector over Shopify's official Admin API: sales, orders, products and customers."
devTitle: "Shopify Admin GraphQL Connector"
devSubtitle: "First-party MCP server over Shopify's official Admin GraphQL API."
ctaUrl: "https://www.shopify.com"
tokenHelpUrl: "https://help.shopify.com/en/manual/apps/app-types/custom-apps"
affiliate: false
tagline: "Your Shopify store, within the agent's reach"
originalAuthor: "Terminal Sync"
originalAuthorUrl: "https://terminalsync.ai"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
---
**Shopify** powers millions of online stores. This connector is **built by Terminal Sync**: we talk to Shopify's **official Admin GraphQL API** so your assistant can read your business and answer in plain language — without you opening the admin.

Unlike other integrations, **you don't install it by pasting a package**: you connect it **inside the app**, at **Settings → Integrations → Shopify**. You paste your store address and an access token you generate in Shopify, hit "Test connection", and you're set. The token is stored **encrypted on your computer** (never in a plain file).

Ask *"how much did I sell this week?"* and it reads your Shopify data and answers. Ask *"show me unfulfilled orders"* and it builds the list. It can also **make safe changes** — like creating a product (saved as a draft) or publishing/unpublishing one — but it **always shows you what it's about to do and waits for your OK** before touching anything. It never changes your store without your confirmation.

### What you can ask

- *"How many sales and how much revenue this week?"*
- *"Show me the last 10 orders and which ones are unfulfilled."*
- *"What products are active and what's their stock?"*
- *"Find the customer with email ana@company.com and how many orders they placed."*

### What you need

You need two things from your Shopify account:

1. **Your store address** — something like `my-store.myshopify.com`.
2. **An access token (Admin API access token)** — created by making a *"custom app"* in your Shopify with read permissions for orders, products and customers. The official guide is at [help.shopify.com](https://help.shopify.com/en/manual/apps/app-types/custom-apps).

Then go to **Settings → Integrations → Shopify** in Terminal Sync, paste both, and connect. The token travels encrypted between your computers alongside the rest of your profile.

--- dev ---

**First-party** connector: Terminal Sync bundles its own MCP server (`terminalsync-shopify-mcp`, a Tauri `externalBin` sidecar) that speaks Shopify's **Admin GraphQL API**. It is not a third-party npm package or a remote server — it's our own code over the official API, chosen because Shopify does not publish an owner-facing store-operating MCP (`@shopify/dev-mcp` is docs/schema only).

**Config (injected by the app from the encrypted store):** `SHOPIFY_STORE_DOMAIN` (e.g. `my-store.myshopify.com`), `SHOPIFY_ADMIN_ACCESS_TOKEN` (`shpat_…`, stored in the OS keychain, never in a config file), and optional `SHOPIFY_API_VERSION`.

**Read tools:** `shopify_shop_info`, `shopify_list_orders`, `shopify_sales_summary`, `shopify_list_products`, `shopify_search_customers`. **Write tools (two-step confirm gate):** `shopify_create_product` (creates a DRAFT), `shopify_set_product_status` (publish/unpublish). Without `confirm` they return a PREVIEW and mutate nothing; the agent shows the preview and only applies with `confirm: true` after the user approves. More writes (price, inventory, fulfillment) can follow the same pattern.

The connection happens at **Settings → Integrations → Shopify** (it verifies the store before saving and wires the server into Claude/Codex/Gemini). Source: Shopify's official Admin GraphQL API (`help.shopify.com`, `shopify.dev`).
