---
name: Stripe
logo: /connectors/stripe.svg
category: automation
status: available
simpleTitle: "Ask your AI about your payments — and let it act on them"
simpleSubtitle: "Official Stripe server: customers, invoices, payments, subscriptions and refunds."
devTitle: "Stripe MCP Connector"
devSubtitle: "Official @stripe/mcp server (stripe/ai): tools over the Stripe API, secret-key scoped."
ctaUrl: "https://stripe.com"
tokenHelpUrl: "https://dashboard.stripe.com/apikeys"
manifest:
  mcpServers:
    stripe:
      command: npx
      args: ["-y", "@stripe/mcp", "--tools=all"]
      env:
        STRIPE_SECRET_KEY: "${SECRET:STRIPE_SECRET_KEY}"
affiliate: false
tagline: "Your payments, within reach of the agent"
originalAuthor: "Stripe"
originalAuthorUrl: "https://github.com/stripe/ai"
license: "MIT"
licenseUrl: "https://github.com/stripe/ai/blob/main/LICENSE"
---
**Stripe** is the payments platform behind millions of businesses — checkout, subscriptions, invoicing and the money side of your product. The official connector, published by Stripe, lets the agent work directly against your Stripe account: look up customers, read invoices and payments, create products and prices, manage subscriptions and issue refunds. The full, always-current list of tools lives in [Stripe's MCP documentation](https://docs.stripe.com/mcp).

Ask *"how much did we bill last month?"* and it reads your Stripe data and answers. Ask *"create a $29/month product called Pro and give me a payment link"* and it sets it up for you — no dashboard clicking. It talks to Stripe with your secret key, so it can do anything you can do from your own account.

### What you can ask

- *"How many active subscriptions do we have right now, and how much recurring revenue is that per month?"*
- *"Find the customer with the email ana@empresa.com and show me their last three invoices."*
- *"Create a product called 'Consultoría 1h' at $80, generate a payment link, and give me the URL."*

### What token you need

You need a Stripe **secret API key** — the key that lets software act on your account.

1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).
2. Start with a **test-mode** key (`sk_test_…`) while you try it — it touches fake data, nothing real moves. Copy it.
3. Paste it when the Lab asks for `STRIPE_SECRET_KEY`. It's stored encrypted in your Keychain.

The secret key can move real money once you switch to a live key (`sk_live_…`), so treat it like a password. Tip: create a **restricted key** in the dashboard to grant only the permissions the agent needs (e.g. read-only on payments) instead of a full-access key.

--- dev ---

`@stripe/mcp` (Stripe, official — repo `stripe/ai`, `tools/modelcontextprotocol`) runs via `npx -y @stripe/mcp --tools=all`. Auth is a Stripe secret key, passed either as the `STRIPE_SECRET_KEY` env var or the `--api-key=` flag; the manifest here uses the env var so the key stays in Keychain. `--stripe-account=<acct>` targets a connected account. The `--tools=` flag selects which tool groups to expose (`all`, or a comma-separated subset).

Tools map onto the Stripe API surface (customers, products, prices, payment links, invoices, subscriptions, refunds, disputes, balance, and documentation search); the authoritative, versioned list is at docs.stripe.com/mcp#tools. Scope the risk with a **restricted key** (Stripe's fine-grained key with per-resource read/write permissions) and start in **test mode** — the same key semantics gate the agent as gate any integration.

Terminal Sync keeps the secret key in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: github.com/stripe/ai.
