---
name: Square
logo: /connectors/square.svg
category: automation
status: available
simpleTitle: "Ask your AI about your Square business — and let it act on it"
simpleSubtitle: "Official Square server (by Block): payments, catalog, orders and customers."
devTitle: "Square MCP Connector"
devSubtitle: "Official square-mcp-server, published by Block."
ctaUrl: "https://squareup.com"
tokenHelpUrl: "https://developer.squareup.com/docs/build-basics/access-tokens"
manifest:
  mcpServers:
    square:
      command: npx
      args: ["square-mcp-server", "start"]
      env:
        ACCESS_TOKEN: "${SECRET:SQUARE_ACCESS_TOKEN}"
        SANDBOX: "true"
affiliate: false
tagline: "Your Square business, within reach of the agent"
originalAuthor: "Square (Block, Inc.)"
originalAuthorUrl: "https://developer.squareup.com"
license: "Apache-2.0"
licenseUrl: "https://www.apache.org/licenses/LICENSE-2.0"
---
**Square** is the platform behind payments, point of sale and the catalog for millions of businesses. The official connector, published by Block, lets AI assistants interact with Square's Connect API — so the agent can work directly against your Square account: process payments, manage your catalog of items and categories, handle orders, and look up customers. The full, always-current list of services lives in [Square's API documentation](https://developer.squareup.com/docs).

Ask *"what did we sell this week?"* and it reads your Square data and answers. Ask *"add a new item to the catalog called Espresso at $3.50"* and it sets it up for you — no dashboard clicking. It talks to Square with your access token, so it can do what you can do from your own account. By default the manifest runs in **sandbox** mode, so nothing real moves while you try it out.

### What you can ask

- *"How many payments did we take today, and what's the total?"*
- *"Find the customer with the email ana@empresa.com and show me their recent orders."*
- *"Add an item called 'Consultoría 1h' at $80 to the catalog."*

### What token you need

You need a Square **access token** — the credential that lets software act on your account. It goes in the env var literally named `ACCESS_TOKEN`.

1. Go to [developer.squareup.com/docs/build-basics/access-tokens](https://developer.squareup.com/docs/build-basics/access-tokens) and follow the guide to get your token.
2. Paste it when the Lab asks for `SQUARE_ACCESS_TOKEN`. It's stored encrypted in your Keychain.
3. The manifest ships with `SANDBOX=true`, which points at Square's sandbox environment — fake data, nothing real moves while you're testing.

When you're ready to work on your real business, switch to production: set `PRODUCTION=true` instead of `SANDBOX=true`. In production the token acts on your real account, so treat it like a password.

--- dev ---

`square-mcp-server` (Square, official — published by Block, maintainer `oss-releases@block.xyz`) runs via `npx square-mcp-server start`. Auth is a Square access token passed as the `ACCESS_TOKEN` env var; the manifest here keeps it in Keychain. Environment toggles from the README: `SANDBOX=true` (sandbox environment) vs `PRODUCTION=true` (production environment), plus `DISALLOW_WRITES=true` to restrict to read-only operations and `SQUARE_VERSION` to pin a Square API version (e.g. `2025-04-16`).

The server exposes three tools — `get_service_info` (discover the methods available for a service), `get_type_info` (get parameter requirements for a method), and `make_api_request` (execute the call) — following a discover → understand → execute pattern. Those tools reach Square's full API ecosystem: per the README's service catalog, `payments`, `catalog`, `orders`, `customers`, `inventory`, `invoices`, `refunds`, `subscriptions`, `loyalty`, `giftcards`, `bookings`, `locations`, `team`, `merchants`, `payouts`, `disputes`, `terminal`, `devices`, and more. The authoritative list is at developer.squareup.com/reference/square.

Terminal Sync keeps the access token in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Apache-2.0. Source: Square MCP Server, published by Block.
