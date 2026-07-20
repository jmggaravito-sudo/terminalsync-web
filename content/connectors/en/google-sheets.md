---
name: Google Sheets
logo: /connectors/google-sheets.svg
category: productivity
status: available
simpleTitle: "Your spreadsheets, answering questions"
simpleSubtitle: "The sheet where you track sales, clients and stock — now your AI reads and updates it for you."
devTitle: "Google Sheets MCP Connector"
devSubtitle: "OAuth read/write over the Sheets API — get, batch-get, update, batch-update, spreadsheet + sheet management."
ctaUrl: "https://www.google.com/sheets/about/"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    google-sheets:
      command: npx
      args: ["-y", "google-sheets-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
affiliate: false
tagline: "Sales, clients and stock at AI reach"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/google-sheets-mcp/blob/master/LICENSE"
---
Almost every small business runs on a spreadsheet. Sales for the month, the client list, inventory, the cash-flow tracker — it all lives in a Google Sheet somebody keeps by hand. This connector lets your AI open that sheet, read it, and update it the same way you would.

Ask *"how much did we sell this week?"* and it reads the sheet and answers with the number — no formulas, no pivot tables. Say *"add María García, $450, pending, to the Orders tab"* and it writes the row. The spreadsheet you already trust becomes something you can just talk to.

### What you can ask

- *"In my 'Sales' sheet, add up this month's total and tell me if we beat last month."*
- *"Add a row to 'Orders': client María García, amount 450, status Pending."*
- *"Look at the 'Inventory' tab and list the products with fewer than 5 units left."*

### What you need

Google Sheets uses Google's sign-in (OAuth), so instead of a simple key you connect it once through a **Google Cloud project**. It sounds technical, but it's a one-time setup and then it just works on every device:

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) and create a project (or pick one you already have).
2. Enable the **Google Sheets API** for that project.
3. Create an **OAuth client ID** (type: Desktop / Web app) and add `http://localhost:3000/callback` as an authorized redirect URL.
4. Copy the **Client ID** and **Client Secret** it gives you and paste them when the Lab asks for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. The first time you use it, a browser window opens to let you approve access to your sheets. After that it's silent.

Both values are stored encrypted in your Keychain and synced across your machines — set it up on one computer, it's ready on the rest.

> Heads up: the Google Cloud setup is the one genuinely fiddly part. If you get stuck, the in-app support chat can walk you through it step by step.

--- dev ---

`google-sheets-mcp` (Adam Jones / @domdomegg — same author as our Airtable connector) speaks the Sheets API over OAuth. Tools verified against the official README:

- **Spreadsheet**: `sheets_spreadsheet_get` (metadata + optional cell data), `sheets_spreadsheet_create`.
- **Values**: `sheets_values_get` (one range), `sheets_values_batch_get` (multiple ranges), `sheets_values_update` (write a range, overwrites), `sheets_values_batch_update` (write multiple ranges).
- **Sheets**: `sheets_sheets_list` (list tabs in a spreadsheet).

Auth is OAuth 2.0 with the `spreadsheets` scope (full read/write). Config env: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` from a Google Cloud OAuth client, redirect `http://localhost:3000/callback`. The server exposes an `/authorize` flow that redirects to Google and encodes the client's callback URL in state — first run opens the browser consent, tokens persist after.

Terminal Sync keeps the client id/secret + refresh token in your Keychain, synced encrypted across machines with AES-256-GCM. Pairs well with the Google Drive connector (same author) for finding, sharing and deleting files.

License: MIT. Source: github.com/domdomegg/google-sheets-mcp.
