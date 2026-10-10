---
name: Alegra
logo: /connectors/alegra.svg
category: automation
status: available
simpleTitle: "Your invoicing and your books, answered in plain language"
simpleSubtitle: "Official Alegra MCP: invoices, contacts, inventory, banks, payments and reports, straight from your account."
devTitle: "Alegra MCP Connector"
devSubtitle: "Official hosted Alegra MCP (mcp.alegra.com) — invoices, contacts, inventory, banks, payments, reports and accounting, over HTTP Basic auth with your Alegra API token."
ctaUrl: "https://www.alegra.com"
tokenHelpUrl: "https://app.alegra.com"
manifest:
  mcpServers:
    alegra:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.alegra.com/mcp", "--header", "Authorization:${ALEGRA_AUTH_HEADER}"]
      env:
        ALEGRA_AUTH_HEADER: "Basic ${SECRET:ALEGRA_API_TOKEN_BASE64}"
affiliate: false
tagline: "Your invoices, your inventory and your reports, within reach of the agent"
originalAuthor: "Alegra"
originalAuthorUrl: "https://developer.alegra.com"
license: "MIT"
licenseUrl: "https://opensource.org/licenses/MIT"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-10T07:31:32.656Z"
verifiedPackageVersion: null
---
**Alegra** is the cloud platform you run your business on: electronic invoicing, contacts, inventory, bank accounts and accounting in one place. The official Alegra connector is a **hosted MCP server** (`https://mcp.alegra.com/mcp`), published by Alegra on its developer portal, that connects your agent to your business operation — in the official docs' words, it *"permite acceso a herramientas de gestión empresarial como inventarios, contactos, facturas, bancos, pagos, retenciones, entre otros"* (gives access to business-management tools such as inventory, contacts, invoices, banks, payments, retentions, among others).

Ask *"How much did I invoice this month, and to which customers?"* and the agent reads your invoices and builds the summary for you. *"What stock do I have for each product?"* comes straight from inventory, no screen-hunting. It also works for you: *"Update Ana Gómez's phone number in her contact details"* or *"Register the payment I received for invoice 245."* Everything lands in your Alegra account, under the same credential you use to access the API.

### What you can ask

- *"How much did I invoice this month, and to which customers?"*
- *"Show me the available stock for each product."*
- *"List my contacts and update Ana Gómez's phone number."*
- *"How much do I owe, and how much am I owed?"*
- *"Show me this month's income statement."*
- *"Register the payment I received for invoice 245."*

### What token you need

You need your **Alegra API user token**, converted to Base64 — the same token the Alegra API uses, in the format the MCP server expects.

1. Sign in to [app.alegra.com](https://app.alegra.com). Top right, click **Configuración** (Settings) and open the **API - Integraciones con otros sistemas** section (API — integrations with other systems). That screen shows the email you use for API access and your token; if you don't have a token yet, you can generate one right there.
2. The server expects the credential as `email:token` encoded in Base64. The docs' own worked example: `Authorization: Basic ZWplbXBsb2FwaUBhbGVncmEuY29tOnRva2VuZWplbXBsb2FwaTEyMzQ1`, where that string is `base64('<ejemploapi@alegra.com>:tokenejemploapi12345')`.
3. Encode your own `email:token` on your computer — never paste access credentials into a "Base64 encoder" website. On the macOS or Linux Terminal: `printf 'email:token' | base64`. On Windows (PowerShell): `[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('email:token'))`.
4. Paste the resulting string when TerminalSync asks for `ALEGRA_API_TOKEN_BASE64`. It's stored encrypted in the app's Secrets and sent to the server as the `Authorization: Basic …` header Alegra expects.

**Honest disclosure:** this is a **server hosted by Alegra** (`https://mcp.alegra.com`), not something running on your computer — your requests travel to Alegra's server, which answers with data from your account. It **reads and writes**: it can create and update invoices, contacts, products and payments, and the documented catalog also includes delete tools (for example, deleting an invoice or a contact). What the agent can do is bounded by your token — the same access your Alegra user has through the API — and the MCP docs describe no server-side confirmation step. The Alegra API documents a usage limit of 150 requests per minute per user; beyond that it answers with a 429 error until the minute rolls over. The data comes from your account, and verifying it is your responsibility.

--- dev ---

Alegra publishes its **official MCP** as a remote/hosted server at `https://mcp.alegra.com` (the "Servidor de Producción" of its OpenAPI definition, v1.0.0), documented on its developer portal (`developer.alegra.com`). There's no npm package or local stdio server — it's bridged with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.alegra.com/mcp --header "Authorization:${ALEGRA_AUTH_HEADER}"
```

**Protocol.** JSON-RPC 2.0 over `POST /mcp`, with the `tools/list` and `tools/call` methods; SSE connection over `GET /mcp` ("Establece conexión SSE (Server-Sent Events) para streaming de eventos MCP"), plus session-close and health-check endpoints of its own. The docs' example invocation is a `tools/call` with `name: "items__getItems"` and `arguments: {"limit": 10, "offset": 0}`.

**Authentication: Basic Access.** The `Authorization` header carries the email and token of the registered Alegra user, separated by a colon and all in Base64 — the same credential as the Alegra API (the MCP definition describes it as "Token de Alegra codificado en Base64 (usuario:token)"; a 401 means invalid credentials). Verbatim example from the docs: `Authorization: Basic ZWplbXBsb2FwaUBhbGVncmEuY29tOnRva2VuZWplbXBsb2FwaTEyMzQ1`. This ficha's manifest injects the credential from the app's Secrets as `${SECRET:ALEGRA_API_TOKEN_BASE64}` inside that header — the `--header` argument carries no spaces around the colon, as the `mcp-remote` README recommends to dodge the escaping bug in some clients.

**Token:** app.alegra.com → **Configuración** → **API - Integraciones con otros sistemas** (shows the API email and the token; generates one if none exists).

**Tool groups (`mcp-groups`).** An optional header — "Grupos de herramientas a habilitar separados por comas" (tool groups to enable, comma-separated) — with the documented values: `invoices`, `items`, `contacts`, `banks`, `income-payments`, `resolutions`, `currencies`, `sellers`, `taxes`, `retentions`, `reports`, `ledger`, `accounting`, `support-center` (docs example: `invoices,items,contacts,banks`). The manifest doesn't send it — the docs don't specify which groups stay active when the header is absent. To narrow the surface, add it as another header to the bridge (`--header "mcp-groups:invoices,items"`).

**Documented catalog by group** (official pages under `developer.alegra.com/reference/`):

- **Sales invoices** (`invoices`): `invoices__getInvoices`, `getInvoiceById`, `getInvoiceByNumber`, `createInvoice`, `updateInvoice`, `deleteInvoice`, `getPaymentTypes`.
- **Products and inventory** (`items` and adjacent groups): `items__getItems`, `getItem`, `createItem`, `updateItem`, `deleteItem`; stock (`get_item_stock`, `get_item_stock_summary`), categories, price lists, warehouses and transfers, inventory adjustments, custom fields and variants.
- **Contacts** (`contacts`): `contacts__getContacts`, `getContactByName`, `createContact`, `updateContact`, `deleteContact`.
- **Banks** (`banks`): banks and bank accounts (list, create, update, delete), reconciliations and transfers between accounts.
- **Payments** (`income-payments`, outgoing payments): received payments (list, create, update, delete) and outgoing payments, including voiding them.
- **Expenses — the "MCP Expenses" package** (`@alegradev/mcp-expenses`): per the docs, it covers "facturas de compra (bills), notas de débito de gastos, órdenes de compra y pagos salientes" (purchase bills, expense debit notes, purchase orders and outgoing payments), with public documented tools invoked the same way via JSON-RPC over `POST /mcp`. Note: that package is not published in the public npm registry as of this ficha (verified 2026-10-10) — the expense groups are documented against the hosted server.
- **Reports** (`reports`): 30 tools — sales by client, seller, product and warehouse (with totals), profitability by product, income statement, general balance, trial balance, cash flow, payables and receivables (with summaries), retentions detail and exportables.
- **Accounting** (`ledger`, `accounting`): ledger categories, accounting journals and cost centers (list, create, update, delete).
- **Support center** (`support-center`): create tickets, retrieve ticket history and search help.
- **Master data**: numbering sequences and resolutions, currencies and exchange rates, sellers, taxes and fiscal retentions.

**Disclosure:** a hosted server (not local) that reads, writes and deletes — the catalog includes delete tools (`deleteInvoice`, `deleteItem`, `deleteContact`, `deleteBankAccount`, …). The MCP docs document no server-side confirmation gate: control stays with the client orchestrating the tools and with the token's permissions. API limit: "150 request por minuto por usuario" (150 requests per minute per user); exceeding it returns a 429, and every response carries the `X-Rate-Limit-Limit`, `X-Rate-Limit-Remaining` and `X-Rate-Limit-Reset` headers.

License: MIT (declared in the MCP Alegra OpenAPI definition). Source: developer.alegra.com — Alegra MCP documentation (`mcpexecute`, `mcpsse`, authentication, request limits). Support: alegra.com/community/c/alegra-api/40.
