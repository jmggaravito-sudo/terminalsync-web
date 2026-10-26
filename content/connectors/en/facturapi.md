---
name: Facturapi
logo: /connectors/facturapi.png
category: automation
markets: ["MX"]
status: available
simpleTitle: "Your Mexican CFDI invoicing, over chat"
simpleSubtitle: "Your AI looks up Facturapi customers and invoices, and creates drafts or invoices when you confirm."
devTitle: "Facturapi MCP Connector"
devSubtitle: "TerminalSync community MCP over the Facturapi v2 API: customers, products and CFDI 4.0 invoices."
ctaUrl: "https://www.facturapi.io"
tokenHelpUrl: "https://dashboard.facturapi.io/integration/apikeys"
manifest:
  mcpServers:
    facturapi:
      command: npx
      args: ["-y", "@terminalsync/facturapi-mcp"]
      env:
        FACTURAPI_SECRET_KEY: "${SECRET:FACTURAPI_SECRET_KEY}"
affiliate: false
tagline: "Your Mexican invoices, within reach"
originalAuthor: "TerminalSync community"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/facturapi"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/facturapi/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "ok"
aiToolsCount: 6
aiReadOnlyTools: 4
verifiedAt: "2026-10-26T22:07:24.531Z"
verifiedPackageVersion: "0.1.0"
---
If you invoice in Mexico with **Facturapi**, this connector gives your AI the paperwork: looking up the number you need and drafting the invoice.

Ask *"how many invoices did I issue this month?"* and it tells you. Ask it to *"create an invoice for customer RFC XABI010101, two consulting hours, bank transfer"* and it builds it; with a test key it never reaches the SAT, and with a live key your AI asks you to confirm before stamping, because stamping **cannot be undone**.

### What you can ask

- *"How many invoices did I issue this month and for how much in total?"*
- *"Look up the customer with RFC XABI010101 and show me their details."*
- *"Create a draft invoice for XABI010101: two consulting hours at $850 plus VAT."*
- *"Turn that draft into the final invoice." (with a live key it will ask you to confirm stamping)*
- *"Show me María López's customer record so I can check her tax regime."*

### How to connect it

With your **Facturapi Secret Key** (dashboard → API Keys):

- The `sk_test_...` key to try things (test invoices never reach the SAT and don't consume folios) or `sk_live_...` for production.
- It is stored encrypted in TerminalSync Secrets, never in the chat or the connector.

### What it covers and what it doesn't

- **Reads** (no confirmation needed): customers and invoices with their line items.
- **Writes, with your confirmation**: creates customers (Facturapi validates the RFC against the SAT) and invoices. With a live key, stamping requires a separate confirmation because a stamped CFDI can only be corrected with a credit memo; `status: draft` needs none. Facturapi's idempotency key is supported so retries don't duplicate invoices.
- **Not covered**: retentions, receipts, payment complements, bulk CFDI downloads or cancellations (Facturapi handles those from its dashboard).
- This is a TerminalSync community project: **not built or endorsed by Facturapi**. Writes have not been tested against a real account yet; the read tools have.
