---
name: Stripe
logo: /connectors/stripe.svg
category: dev
status: available
simpleTitle: "Your AI looks at Stripe without you copy-pasting"
simpleSubtitle: "Charges, subscriptions, refunds — ask in plain language and reply to your customer faster."
devTitle: "Stripe MCP Connector"
devSubtitle: "Read + write tools across Customers, Charges, Subscriptions, Invoices, Refunds and Disputes."
ctaUrl: "https://stripe.com/"
affiliate: false
tagline: "Your billing dashboard, now askable"
manifest:
  command: npx
  args: ["-y", "@stripe/mcp", "--tools=all"]
  env:
    STRIPE_SECRET_KEY: "${SECRET:STRIPE_SECRET_KEY}"
---

When a customer writes "I didn't get last month's invoice" or "charge me again with a different card", opening Stripe, finding the customer, checking the invoice and replying takes 5 minutes. Per customer.

With this connector you tell Claude *"find the customer with email X, give me their latest invoice, resend it to this other address"* and the answer arrives in seconds. Without leaving the chat.

Set up once, follows you to every machine via Terminal Sync.

--- dev ---

The official `@stripe/mcp` server exposes Customers, Charges, PaymentIntents, Subscriptions, Invoices, Refunds, Disputes and Products as tools. The `--tools=all` flag mounts the full surface; scope it to `--tools=read-only` for production agents that shouldn't write.

Terminal Sync stores the secret key in the OS Keychain via `apiKeyHelper` and replicates the `claude_desktop_config.json` snippet across machines, encrypted end-to-end. Switch from laptop to studio tower — your agent keeps access to the same Stripe account without re-pasting `sk_live_*`.

**Best for**: founders running ad-hoc support from the IDE; finance ops querying billing without opening the dashboard; SRE automating charge ops.

**Scopes**: by default, only the secret key of the project you pick. Recommended: create a restricted key with read-only permissions for agents that shouldn't take money.
