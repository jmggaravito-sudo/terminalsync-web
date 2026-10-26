---
name: Wompi
logo: /connectors/wompi.svg
category: automation
markets: ["CO"]
status: available
simpleTitle: "Get paid with PSE, Nequi or Bancolombia without opening your bank app"
simpleSubtitle: "Your AI checks your Wompi transactions and builds payment links for you, in chat."
devTitle: "Wompi MCP Connector"
devSubtitle: "TerminalSync community MCP over the Wompi API: transactions, merchant info and payment links."
ctaUrl: "https://wompi.co"
tokenHelpUrl: "https://docs.wompi.co/docs/colombia/ambientes-y-llaves/"
manifest:
  mcpServers:
    wompi:
      command: npx
      args: ["-y", "wompi-mcp"]
      env:
        WOMPI_PUBLIC_KEY: "${SECRET:WOMPI_PUBLIC_KEY}"
        WOMPI_PRIVATE_KEY: "${SECRET:WOMPI_PRIVATE_KEY}"
affiliate: false
tagline: "Your Wompi collections, within reach"
originalAuthor: "TerminalSync community"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/wompi"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/wompi/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "ok"
aiToolsCount: 4
aiReadOnlyTools: 3
verifiedAt: "2026-10-26T22:05:15.921Z"
verifiedPackageVersion: "0.1.0"
---
If you get paid through **Wompi** (Bancolombia's payment gateway), this connector hands your AI the two things that eat most of your time: checking whether a payment landed, and building the link to charge a customer.

Ask *"did the payment for reference 12345 go through?"* and it tells you approved, pending or declined. Ask it to *"create an $80,000 COP payment link for María, single-use"* and you get a link ready to send over WhatsApp. It supports PSE, Nequi, the Bancolombia transfer button, cards and more, depending on what your merchant account has enabled.

### What you can ask

- *"Did payment for reference 12345 go through? How much and with which method?"*
- *"Create a single-use payment link for $80,000 COP for María."*
- *"Create an open donation link with no fixed amount, expiring on the 30th."*
- *"Show me today's transactions and tell me which ones are still pending."*
- *"Which payment methods does my merchant account have enabled in Wompi?"*

### How to connect it

With your **merchant keys** from the Wompi panel (comercios.wompi.co → Desarrollo → Programadores):

- The **public key** (`pub_test_...` or `pub_prod_...`) and the **private key** (`prv_test_...` / `prv_prod_...`).
- They are stored encrypted in TerminalSync Secrets, never in the chat or the connector.
- The connector detects on its own whether your keys are **test** (sandbox) or **production** from the prefix: no real money moves while you use `test` keys.
- To try it safely: turn on **Test mode** in the Wompi panel and use the `test` keys with Wompi's published test data.

### What it covers and what it doesn't

- **Reads** (no confirmation needed): your merchant data (name, tax ID, accepted methods) and your transactions with status and payment method.
- **Writes, with your confirmation**: creates payment links (`name`, amount in cents, `single_use`, expiry and more, per Wompi's documentation). Your AI asks before creating any link.
- **Not covered**: refunds, payout disbursement, datáphones or creating charges directly (transactions). It never changes your Wompi settings.
- This is a TerminalSync community project: **not built or endorsed by Wompi**. Link creation has not been verified against a real account yet (it needs the test private key); the read tools have.
