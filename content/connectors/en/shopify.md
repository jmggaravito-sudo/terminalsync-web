---
name: Shopify
logo: /connectors/shopify.svg
category: automation
status: soon
simpleTitle: "Your Shopify store, with your AI — not available yet"
simpleSubtitle: "Not available yet in TerminalSync: Shopify doesn't publish a public address we can plug in."
devTitle: "Shopify (not available yet)"
devSubtitle: "No public official MCP address to bridge; built-in connector retired."
ctaUrl: "https://www.shopify.com"
tokenHelpUrl: "https://help.shopify.com/en/manual/ai-powered-tools/connecting-ai-tools/shopify-connector-for-claude"
affiliate: false
tagline: "Shopify: not available yet in TerminalSync"
originalAuthor: "Shopify"
originalAuthorUrl: "https://help.shopify.com/en/manual/apps/connecting-ai-tools"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
installableForAi: false
installableForAiReason: "no-manifest"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-09-19T12:19:33.156Z"
verifiedPackageVersion: null
---
**Shopify** is not available in TerminalSync yet, and we'd rather say so than promise something we can't deliver.

We used to have a connector built into the app. That built-in connector was **retired on 2026-09-10**, so there is **no "Settings → Integrations" step** to follow anymore, and this page does not offer one. Today TerminalSync **cannot read or change your Shopify store**.

### What you can ask

- *Today, nothing about your store:* TerminalSync can't read or change your Shopify data yet.
- *"How do I set up shipping rates in Shopify?"* — general questions work, and the answer comes from general knowledge, not from your store.
- *"Here is the orders export I downloaded from Shopify — which products sell the most?"* — you export the file from your Shopify admin and share it in the chat.

### Why it isn't available

The connectors in TerminalSync that work with a simple login use an **official address published by the vendor**. For Shopify, we did not find one we can use:

- Shopify does offer official connectors for business owners, but they are installed **from inside certain AI tools' own connector directories** (Shopify's help center describes the one for Claude), and Shopify's pages don't publish a server address that TerminalSync could connect to. See [Shopify's page on connecting AI tools](https://help.shopify.com/en/manual/apps/connecting-ai-tools).
- Shopify's developer MCP (`@shopify/dev-mcp`) is for people **building apps and themes**: it works with Shopify's documentation and doesn't need your store login. It is not a way to ask about your sales or orders.
- Shopify's storefront servers are meant for **shoppers' assistants** talking to a public store, not for the owner managing it.

We'll add Shopify as soon as it has an official address we can connect with your own login, and we'll update this page then.

--- dev ---

Status: **blocked, not available**. The first-party sidecar (`terminalsync-shopify-mcp`) and its Settings → Integrations flow were retired from the app on 2026-09-10; there is no manifest and none of its tools exist anymore.

Researched 2026-10-14 against official sources: (1) Shopify Dev MCP / AI Toolkit (`shopify.dev/docs/apps/build/devmcp`, `shopify.dev/docs/apps/build/ai-toolkit`): runs locally via `@shopify/dev-mcp`, needs no authentication, documentation/schema/validation for developers; store management goes through Shopify CLI's authenticated store context, not an MCP URL. (2) Storefront MCP (`shopify.dev/docs/apps/build/storefront-mcp`): `https://{shop}/api/mcp` and the UCP endpoints are per-store, shopper-facing. (3) Merchant connectors (`help.shopify.com/en/manual/ai-powered-tools/connecting-ai-tools/shopify-connector-for-claude`): installed from Claude's directory and approved in the Shopify admin; the page publishes no MCP URL, so it cannot be bridged with `mcp-remote` from a documented address.

Unblock condition: Shopify documents a public remote MCP URL for merchants that `node scripts/smoke-remote-login.mjs --slugs shopify` can reach the authorization step on.
