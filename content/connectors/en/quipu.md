---
name: Quipu
logo: /connectors/quipu.png
category: automation
markets: ["ES"]
status: available
simpleTitle: "Your Spanish freelance accounting, over chat"
simpleSubtitle: "Your AI looks up Quipu contacts, invoices and book entries, and creates invoices when you confirm."
devTitle: "Quipu MCP Connector"
devSubtitle: "TerminalSync community MCP over the Quipu v1 API (getquipu.com): contacts, invoices and book entries."
ctaUrl: "https://getquipu.com"
tokenHelpUrl: "https://help.getquipu.com/es/articles/7950432-conectar-con-la-api-de-quipu"
manifest:
  mcpServers:
    quipu:
      command: npx
      args: ["-y", "quipu-mcp"]
      env:
        QUIPU_APP_ID: "${SECRET:QUIPU_APP_ID}"
        QUIPU_APP_SECRET: "${SECRET:QUIPU_APP_SECRET}"
        QUIPU_OWNER_SLUG: "${SECRET:QUIPU_OWNER_SLUG}"
affiliate: false
tagline: "Your Quipu numbers, within reach"
originalAuthor: "TerminalSync community"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/quipu"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/quipu/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
---
If you run your invoicing and expenses with **Quipu**, this connector gives your AI the lookups that today force you into the dashboard: how much you invoiced, who that client is, whether an invoice got paid.

Ask *"how much did I invoice in March?"* and it adds it up. Ask it to *"find the client Fisioterapia Ana and tell me if she has unpaid invoices"* and it checks. It can also create contacts and income invoices, always asking for your confirmation first, because in Spain every invoice is recorded under Veri*Factu rules.

### What you can ask

- *"How much did I invoice this month compared to last month?"*
- *"Find the client Fisioterapia Ana and tell me if she has unpaid invoices."*
- *"Break down my March expenses by category."*
- *"Create a new contact: B12345674, Estudio Jurídico Ruiz, NIF, Madrid."*
- *"Create the income invoice for Estudio Jurídico Ruiz: March consulting, dated today." (it will ask you to confirm)*

### How to connect it

With your **Quipu API v1 credentials** (Configuración → Integraciones → API v1 → Activar → Credenciales):

- The **App ID**, the **App secret** and your **account slug** (the one in your Quipu address, `getquipu.com/d/<slug>`).
- They are stored encrypted in TerminalSync Secrets. The connector renews its session on its own (tokens last ~2 hours).

### What it covers and what it doesn't

- **Reads** (no confirmation needed): contacts (filterable by tax ID, kind or country), invoices (free-text search and by period) and book entries.
- **Writes, with your confirmation**: creates contacts and income invoices. Every invoice requires a separate confirmation because it lands in your book under Veri*Factu. The connector manages its session lifecycle and never retries writes.
- **Not covered**: simplified invoices, expense entries, paysheets, bank reconciliation or tax filings. It deletes nothing.
- This is a TerminalSync community project: **not built or endorsed by Quipu/TeamSystem**. Writes have not been tested against a real account yet; the read tools have (against a real trial account).
