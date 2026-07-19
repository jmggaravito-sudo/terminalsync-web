---
name: Xero
logo: /connectors/xero.svg
category: automation
status: available
simpleTitle: "Your accounting, answering out loud"
simpleSubtitle: "\"Who owes me money?\" \"What's overdue?\" \"How did we do last month?\" — your AI reads your books for you."
devTitle: "Xero MCP Connector"
devSubtitle: "OAuth2 custom-connection over the Xero Accounting API — invoices, aged receivables, payments, P&L, balance sheet, contacts."
ctaUrl: "https://www.xero.com"
tokenHelpUrl: "https://developer.xero.com/documentation/guides/oauth2/custom-connections/"
manifest:
  mcpServers:
    xero:
      command: npx
      args: ["-y", "@xeroapi/xero-mcp-server"]
      env:
        XERO_CLIENT_ID: "${SECRET:XERO_CLIENT_ID}"
        XERO_CLIENT_SECRET: "${SECRET:XERO_CLIENT_SECRET}"
affiliate: false
tagline: "Invoices, cash owed and P&L at AI reach"
originalAuthor: "Xero"
originalAuthorUrl: "https://github.com/XeroAPI/xero-mcp-server"
license: "MIT"
licenseUrl: "https://github.com/XeroAPI/xero-mcp-server/blob/master/LICENSE"
---
The part of the business nobody wants to open is the accounting. Who owes you, what you owe, which invoices are overdue, whether last month actually made money. If you keep your books in **Xero**, this connector lets your AI read them and answer those questions in plain words — no reports to build, no columns to hunt through.

Ask *"who owes me money and how much?"* and it pulls your aged receivables. Ask *"what's overdue?"* and it lists the invoices past their due date. Ask *"how did we do last month?"* and it reads your profit & loss. It can also draft an invoice or a quote for you to review before you send it — it never sends money or finalizes anything on its own.

### What you can ask

- *"List my unpaid invoices and tell me which ones are overdue and by how many days."*
- *"How much did we bill this month versus last month?"*
- *"Draft an invoice for client María García, $450, for 'consulting', due in 15 days."*

### What you need

Xero connects through a **Custom Connection** — Xero's way of linking one app to one company's books. It's a one-time setup in Xero's developer portal:

1. Go to [developer.xero.com](https://developer.xero.com/documentation/guides/oauth2/custom-connections/) and create a **Custom Connection** app for your organization.
2. Add the scopes you want the AI to have — at minimum `accounting.transactions` and `accounting.contacts` (read); add the read-only reports scope for P&L and balance sheet.
3. Copy the **Client ID** and **Client Secret** it gives you and paste them when the Lab asks for `XERO_CLIENT_ID` and `XERO_CLIENT_SECRET`.

Both values are stored encrypted in your Keychain and synced across your machines. The connection is tied to your one company, so the AI only ever sees your books — nothing else.

> Heads up: Custom Connections need a paid Xero plan and are the one genuinely fiddly setup step. If you're in Latin America and use **Alegra** or **Siigo** instead of Xero, those don't have a connector yet — tell us and we'll look at building one. In the meantime, many of the "invoices and budget" questions also work through the **Google Sheets** connector if you track them in a spreadsheet.

--- dev ---

`@xeroapi/xero-mcp-server` (published by **Xero**, official) speaks the Xero Accounting API over OAuth2. Tools verified against the package README:

- **Read**: `list-invoices`, `list-credit-notes`, `list-payments`, `list-aged-receivables-by-contact`, `list-aged-payables-by-contact`, `list-contacts`, `list-accounts`, `list-bank-transactions`, `list-items`, `list-quotes`, `list-tax-rates`, `list-organisation-details`, and reports `list-profit-and-loss`, `list-report-balance-sheet`, `list-trial-balance` (plus payroll `list-*`).
- **Write**: `create-invoice`, `create-payment`, `create-quote`, `create-credit-note`, `create-contact`, `create-bank-transaction`, `create-item`, and the matching `update-*` tools.

Auth is OAuth2 via **Custom Connections** (machine-to-machine, one organisation per connection): env `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET`, optional `XERO_SCOPES` (space-separated) to override defaults. The server tries V1 (bundled) scopes first and falls back to V2 (granular). A `XERO_CLIENT_BEARER_TOKEN` alternative exists and takes precedence when set.

Terminal Sync keeps the client id/secret in your Keychain, synced encrypted across machines with AES-256-GCM. Because create/update tools mutate real accounting records, the desktop gates those behind a confirmation step.

License: MIT. Source: github.com/XeroAPI/xero-mcp-server.
