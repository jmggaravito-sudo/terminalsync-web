---
name: Gmail
logo: /connectors/gmail.svg
category: messaging
status: available
simpleTitle: "Your inbox, talking to your AI"
simpleSubtitle: "\"Anything urgent today?\" \"Summarize the emails from client X\" — without pasting anything."
devTitle: "Gmail MCP Connector"
devSubtitle: "OAuth over the Gmail API — read/search messages and threads, send and manage (labels, archive)."
ctaUrl: "https://gmail.com"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    gmail:
      command: npx
      args: ["-y", "gmail-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
affiliate: false
tagline: "Smart inbox triage"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg/gmail-mcp"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/gmail-mcp/blob/master/LICENSE"
---
You arrive in the morning to 80 unread emails. You ask *"what's urgent today?"* and your AI reads your inbox and tells you what actually matters. You ask *"summarize what client X sent this week"* and it pulls the thread and gives you the gist. It's the connector that turns your inbox from a pile you dread into something you can just ask about — and it's the one most of your automations quietly rely on.

Say *"draft a reply to María, formal tone"* and it writes it. It never sends on its own — you review, then it sends when you say so.

### What you can ask

- *"What came in overnight that needs an answer today?"*
- *"Find the email with the quote from the León supplier and tell me the price."*
- *"Draft a friendly reply confirming the meeting for Thursday — don't send it yet."*

### What you need

Gmail uses Google's sign-in (OAuth), the same as our Google Sheets and Calendar connectors — so if you set those up, this reuses the exact same Google project:

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) and create a project (or reuse the one from Sheets/Calendar).
2. Enable the **Gmail API** for that project.
3. Create an **OAuth client ID** and copy the **Client ID** and **Client Secret**.
4. Paste them when the Lab asks for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. First use opens a browser window to approve access to your inbox. After that it's silent.

Both values are stored encrypted in your Keychain and synced across your machines.

> Heads up: reading and searching happen freely; **sending an email goes out to a real person**, so the AI shows you the draft and only sends when you confirm. If you already set up Sheets or Calendar, use the same Google project here and skip most of the setup.

--- dev ---

`gmail-mcp` (Adam Jones / @domdomegg — same author as our Google Sheets and Airtable connectors) speaks the Gmail API over OAuth. Tools verified against the README: read/search — `gmail_get_profile`, `gmail_messages_list` (search operators), `gmail_message_get`, `gmail_threads_list`; write/manage — `gmail_message_send`, `gmail_message_forward`, `gmail_message_modify` (labels), `gmail_message_archive`, `gmail_message_trash`/`_untrash`, `gmail_message_delete`.

Auth is OAuth 2.0 with `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (the server acts as an OAuth proxy to Google — same pattern as `google-sheets-mcp`, so one Google project can back Sheets, Calendar and Gmail). First run opens the browser consent; tokens persist after.

Terminal Sync keeps the client id/secret + refresh token in your Keychain, synced encrypted across machines with AES-256-GCM. Sends are public/irreversible, so the desktop gates `gmail_message_send`/`_forward`/`_delete` behind a confirmation step; read and search run freely.

License: MIT. Source: github.com/domdomegg/gmail-mcp.
