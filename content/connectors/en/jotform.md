---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Create forms and read your Jotform responses from the chat"
simpleSubtitle: "Official Jotform MCP: create forms, read responses and summarize results with your Jotform account sign-in — no API key to paste."
devTitle: "Jotform MCP Connector"
devSubtitle: "Official hosted Jotform MCP (mcp.jotform.com) — forms and responses over OAuth; separate product servers for Sign and Apps."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Your forms and their responses, one ask away"
originalAuthor: "Jotform"
originalAuthorUrl: "https://github.com/jotform/mcp-server"
license: "MIT"
licenseUrl: "https://github.com/jotform/mcp-server/blob/master/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-02T14:20:00.000Z"
verifiedPackageVersion: null
---
**Jotform** is one of the most widely used form platforms in the world: satisfaction surveys, orders, applications, event registrations — the form you build once and your customers fill out afterwards. Jotform's official MCP server lets your agent work those forms with you — in their own words, *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps"* — without pasting any API key into TerminalSync, just the sign-in of your Jotform account.

Ask *"Find my forms"* and it lists them. Ask *"Create a customer feedback form with a rating and a comment"* and it builds one ready to share. Ask *"Summarize this week's responses to my feedback form"* and it returns the patterns without you opening Jotform. The main server works with **forms and their responses as text**; the official docs also document three product servers (forms with previews and tables, documents for signature with Jotform Sign, and client portals with Jotform Apps) that connect separately — the TerminalSync connector uses the main one.

One important fact from the official docs: **the Jotform MCP is free** — *"Jotform MCP is free. Your Jotform plan limits still apply."* What does apply are your Jotform plan's usage limits, and if the server answers with an HTTP 429 the official advice is *"You sent too many requests. Wait and try again."*

### What you can ask

- *"Find my forms."*
- *"Create a customer feedback form with a rating and a comment."*
- *"Summarize this week's responses to my feedback form."*
- *"How many responses did my order form get today?"*
- *"Send the registration form to this email."*
- *"What patterns do you see in last month's responses?"*

Before anything that changes your forms — creating or editing one — your agent asks for confirmation first.

### How you connect

This connector **does not ask you to paste any API key**. It uses the sign-in of your own Jotform account — the official docs say it verbatim: *"You sign in to Jotform in your browser... You never paste a password or API key."*

1. Activate the connector in TerminalSync.
2. The `mcp-remote` bridge opens the Jotform sign-in in your browser.
3. You sign in and approve access. *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."* The official guide lives at [jotform.com/developers/mcp](https://www.jotform.com/developers/mcp/?tab=mcp).

You can revoke access any time from your Jotform account: **My Account → Connected Apps → Jotform MCP → Clients**, pick the client and choose **Revoke** — documented exactly like that in the official docs.

**Honest disclosure:** this is a server **hosted by Jotform** (`https://mcp.jotform.com`), not something running on your computer. What the agent can see or do is limited by what you approve at sign-in and by what your Jotform account already has. If your organization runs Jotform Enterprise, an admin must install the connection — also in the official docs.

--- dev ---

Jotform publishes an **official remote MCP server** — the MCP registry lists `com.jotform/mcp`, and the vendor repo is `github.com/jotform/mcp-server` (MIT, org `jotform`). Official server docs: `jotform.com/developers/mcp/?tab=mcp`, with the repo guide under `docs/` (`endpoints.md`, `tools.md`, `authentication.md`).

TerminalSync uses the `mcp-remote` bridge to connect your machine to the hosted endpoint:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

Official endpoints: one **main server** (`https://mcp.jotform.com` — forms and responses, as text; the Gemini extension's `/default` address has the same tools) and **three product servers**: `https://mcp.jotform.com/mcp-app` (forms with previews and tables — the main server's tools except `get_submissions`, plus `display_form`, `list_submissions`, `create_submission`, `get_embed_code`, `get_teams`), `https://mcp.jotform.com/mcp-sign-v1` (Jotform Sign: `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`) and `https://mcp.jotform.com/mcp-jotform-apps-v1` (Jotform Apps: `create_app`, `edit_app`, `search`, `fetch`, `get_teams`). This connector ships the main server; the product servers connect separately (Jotform's Claude plugins install them one at a time).

Main-server tools, verbatim from the official docs (`docs/mcp/tools.md`): `search` (*"Finds forms and apps"*), `create_form` (*"Creates a form from your description"*), `edit_form` (*"Changes a form"*), `fetch` (*"Reads one form or response"*), `get_submissions` (*"Lists the responses of a form"*), `assign_form` (*"Sends a form to someone by email"*) and `analyze_submissions` (*"Summarizes responses and finds patterns"*). Official note: *"Your AI tool shows the current tool list after you connect"* — always use the schema from the server you are connected to.

Auth: Jotform sign-in in the browser; *"You never paste a password or API key."* No `env` and no `${SECRET:…}` — pure OAuth mold. Scope: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."* Revocation: `My Account → Connected Apps → Jotform MCP → Clients` → Revoke. Documented limit: HTTP 429 on too many requests (*"You sent too many requests. Wait and try again."*). Cost: *"Jotform MCP is free. Your Jotform plan limits still apply."*

Smoke 2026-11-02: `POST initialize` to `https://mcp.jotform.com` without credentials → **401** (live server, requires OAuth before sign-in). Markets: `["GLOBAL"]` — the MCP docs declare no country restrictions (Jotform operates globally; the only documented requirement is a Jotform account).

License: MIT (LICENSE of `github.com/jotform/mcp-server`); the Jotform service is proprietary SaaS under `jotform.com/terms`. Source: github.com/jotform/mcp-server (README + docs/mcp/*.md, read verbatim 2026-11-02) + jotform.com/developers/mcp/?tab=mcp.
