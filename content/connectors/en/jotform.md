---
name: Jotform
logo: /connectors/jotform.png
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Your Jotform forms, handled by conversation"
simpleSubtitle: "Official Jotform MCP server: create forms, read responses and prepare documents for signature with your account login."
devTitle: "Jotform MCP Connector"
devSubtitle: "Official hosted Jotform MCP (mcp.jotform.com) — forms, responses and the Sign and Apps product servers."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Forms and signatures, within reach of the agent"
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
verifiedAt: "2026-10-26T15:15:00.000Z"
verifiedPackageVersion: null
---
**Jotform** is the forms platform businesses use to capture orders, registrations and customer data — and to prepare documents for signature and build client-portal apps. The official Jotform connector is a **hosted MCP server** (`https://mcp.jotform.com`); its mission, in official words: *"Create forms, read responses, prepare documents for signature, and build apps."*

What that means day to day: through the main server your agent can search forms, create them from a description, edit them, read a single response, analyze responses (summaries and patterns) and email a form to someone. The official docs list the main server's tools: `search`, `create_form`, `edit_form`, `fetch`, `get_submissions`, `assign_form` and `analyze_submissions`. For signatures and apps, Jotform additionally publishes two separate product servers: **Sign** (`mcp.jotform.com/mcp-sign-v1`, documents for signature) and **Apps** (`mcp.jotform.com/mcp-jotform-apps-v1`, client portals and event apps).

### What you can ask

- *"Create a workshop registration form with name, email and preferred time slot."*
- *"How many responses did my contact form get this week, and what patterns do you see?"*
- *"Find the orders form and bring me today's responses."*
- *"Email the contract form to this client."*

### How you connect

This connector **doesn't ask you to paste an API key** — the docs are blunt: *"You never paste a password or API key."*

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Jotform's login in your browser: *"Sign in to Jotform in your browser and approve access."*
3. Come back to TerminalSync and the tools are ready: *"Your AI tool sees what your Jotform account can see"* and *"It cannot do more than your account can."*

**Honest note:** this is a **server hosted by Jotform**, not something that runs on your computer. When connected by server address (this connector's path), the documented scope is **forms and responses**; signatures and apps run on Jotform's product servers. Your organization may limit which connections you can use (*"Your organization may limit which connections you can use"*), and workspace installs are done by an admin. You can revoke access anytime from My Account → Connected Apps → Jotform MCP → Clients. The official repo is a young project (10 commits as of 2026-10-26): the docs and the server are just getting started.

--- dev ---

Jotform publishes its MCP server as a **remote/hosted server**, documented in the official repo `github.com/jotform/mcp-server` and at `jotform.com/developers/mcp/?tab=mcp`. Main server: `https://mcp.jotform.com` — *"Jotform has one main MCP server and three product servers. Most people only need the main server."*; product servers: `https://mcp.jotform.com/mcp-app` (Forms), `https://mcp.jotform.com/mcp-sign-v1` (Sign), `https://mcp.jotform.com/mcp-jotform-apps-v1` (Apps) and `https://mcp.jotform.com/default` (the same main server, for the Gemini extension). Client requirement: *"Your tool must support remote HTTP MCP servers and browser sign-in."* The catalog bridge:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

Auth: browser sign-in, no passwords or API keys; the connection is revocable from My Account → Connected Apps → Jotform MCP → Clients (*"The AI tool must sign in again to use Jotform."* after revoking).

Main server tools (7, verbatim from the official docs): `search` (*"Finds forms and apps."*), `create_form` (*"Creates a form from your description."*), `edit_form` (*"Changes a form."*), `fetch` (*"Reads one form or response."*), `get_submissions` (retrieves a form's responses), `assign_form` (*"Sends a form to someone by email."*), `analyze_submissions` (*"Summarizes responses and finds patterns."*). The Forms server (`/mcp-app`) carries all main-server tools except `get_submissions`, plus the app-specific ones: `display_form`, `list_submissions`, `create_submission`, `get_embed_code` and `get_teams`. Sign (`/mcp-sign-v1`): `search`, `list_submissions`, `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`, `get_teams`. Apps (`/mcp-jotform-apps-v1`): `search`, `fetch`, `create_app`, `edit_app`, `get_teams`. Mind the duplicate names: *"search finds forms and apps on the main server, documents on the Sign app, and apps on the Apps app"* — *"Each tool works on its own server's product."*

Disclosure: permission parity with the account (*"It cannot do more than your account can"*); rate limiting with 429 (*"You sent too many requests. Wait and try again."*); MCP Apps previews and tables only render in clients that support Apps.

License: MIT (LICENSE of the official `jotform/mcp-server` repo). Source: github.com/jotform/mcp-server (README + `docs/mcp/endpoints.md` + `docs/mcp/tools.md` + `docs/mcp/authentication.md`).
