---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Your forms and their responses, within your agent's reach"
simpleSubtitle: "Jotform's official MCP server: create forms, read responses and send them by email, connecting with your Jotform account."
devTitle: "Jotform MCP connector"
devSubtitle: "Jotform's official hosted MCP (mcp.jotform.com) — forms, responses and analysis, with browser sign-in."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Forms that capture customers, managed by conversation"
originalAuthor: "Jotform"
originalAuthorUrl: "https://github.com/jotform/mcp-server"
license: "proprietary"
licenseUrl: "https://www.jotform.com/terms/"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 7
aiReadOnlyTools: 4
verifiedAt: "2026-11-09T12:00:00.000Z"
verifiedPackageVersion: null
---
**Jotform** is the forms platform businesses use to capture customers, take orders and collect information of every kind — from its official README: *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps."*

What that means in practice: your agent can create forms from a plain-language description, edit them, read the responses that come in, summarize them and spot patterns, and email a form to a customer. This is Jotform's main server, with **7 documented tools** for forms and their responses.

### What you can ask

- *"Find my forms and tell me which ones received responses this week."*
- *"Create a customer feedback form with a rating and a comment field."*
- *"Summarize this week's responses to my feedback form and tell me what patterns you see."*
- *"Email the quote form to this customer."*

### How you connect

This connector **does not ask you to paste any API key**. It connects with your Jotform account:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens `https://mcp.jotform.com` in your browser so you can sign in with your Jotform account and approve access.
3. Return to the agent and the Jotform tools are ready. The connection is tied to your account: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."*

**Honest disclosure:** this is a **server hosted by Jotform** — not something that runs on your computer. The Jotform MCP is free, but your Jotform plan limits still apply (*"Jotform MCP is free. Your Jotform plan limits still apply"*). If an organization manages your account, an admin can restrict which connections you may use. And whenever you want to cut access off, you revoke it from **My Account → Connected Apps → Jotform MCP → Clients** — the tool would then have to sign in again.

--- dev ---

Jotform ships its MCP server as a **remote/hosted server**, documented at `jotform.com/developers/mcp/?tab=mcp` and in the official repo `github.com/jotform/mcp-server` (MIT). Main server endpoint: `https://mcp.jotform.com` — responses come back as text. The official guide for generic clients is exactly this path: *"Add the server address … Codex, Cursor, VS Code, any MCP tool"*, and the README points to `docs/mcp/endpoints.md` as the source. Auth is **browser sign-in** (OAuth): *"You sign in to Jotform in your browser. Your AI tool then keeps the connection for you. You never paste a password or API key."* The client must support remote HTTP MCP servers and browser sign-in.

Official tools of the main server (7, verbatim from `docs/mcp/tools.md`):

| Tool | What it does (per the official docs) |
|---|---|
| `search` | Finds forms and apps. |
| `create_form` | Creates a form from your description. |
| `edit_form` | Changes a form. |
| `fetch` | Reads one form or response. |
| `get_submissions` | Lists the responses of a form. |
| `assign_form` | Sends a form to someone by email. |
| `analyze_submissions` | Summarizes responses and finds patterns. |

Four are read-only, three are writes (`create_form`, `edit_form`, `assign_form`). HTTP 429 errors mean too many requests were sent (*"You sent too many requests. Wait and try again"*).

The same infrastructure exposes per-product servers for Jotform's Claude plugins: `https://mcp.jotform.com/mcp-app` (previews and tables, requires MCP Apps support in the client), `https://mcp.jotform.com/mcp-sign-v1` (documents for signature: `create_sign_document`, `send_for_signature`, `get_signing_status`, among others) and `https://mcp.jotform.com/mcp-jotform-apps-v1` (client portals and apps). This catalog connector uses the **main server**, which is the documented path for generic MCP clients; responses arrive as text, with no previews or tables.

License: proprietary SaaS (Jotform terms, `jotform.com/terms/`); the MCP repo is MIT. Source: official repo `github.com/jotform/mcp-server` (`README.md`, `docs/mcp/endpoints.md`, `docs/mcp/tools.md`, `docs/mcp/authentication.md`) + official page `jotform.com/developers/mcp/?tab=mcp`.
