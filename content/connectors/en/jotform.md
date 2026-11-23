---
name: Jotform
logo: /connectors/jotform.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Your Jotform forms and responses, managed by conversation"
simpleSubtitle: "Jotform's official MCP server: create forms, read responses, and prepare documents for signature with your Jotform account — no API key."
devTitle: "Jotform MCP connector"
devSubtitle: "Jotform's official hosted MCP (mcp.jotform.com) — Forms, Sign, and Apps via browser sign-in."
ctaUrl: "https://www.jotform.com"
tokenHelpUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
manifest:
  mcpServers:
    jotform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.jotform.com"]
affiliate: false
tagline: "Forms, signatures, and customer responses, within reach of your agent"
originalAuthor: "Jotform"
originalAuthorUrl: "https://www.jotform.com/developers/mcp/?tab=mcp"
license: "MIT"
licenseUrl: "https://github.com/jotform/mcp-server/blob/master/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-23T00:00:00.000Z"
verifiedPackageVersion: null
---
**Jotform** is the forms platform businesses use to capture orders, registrations, quotes, and customer feedback — and with Jotform Sign it turns documents into digitally signed agreements. Jotform's official connector is a **hosted MCP server** (`https://mcp.jotform.com`). In its own words: *"Use Jotform from your AI assistant. Create forms, read responses, prepare documents for signature, and build apps."*

What that means in practice: your agent can create and edit forms from a plain-language description, read the responses that come in, summarize them and spot patterns, and send a form to someone by email. Beyond that main server, Jotform exposes two product servers: **Jotform Sign** (prepare documents, send them for signature, and track each signer's progress) and **Jotform Apps** (client portals and event apps). The main server exposes **7 tools**; Sign and Apps add theirs at `mcp.jotform.com/mcp-sign-v1` and `mcp.jotform.com/mcp-jotform-apps-v1`.

### What you can ask

- *"Find my forms."*
- *"Create a customer feedback form with a rating and a comment."*
- *"Summarize this week's responses to my feedback form and tell me what patterns you see."*
- *"Prepare a service agreement draft from these terms and send it for signature."* (Sign)

### How you connect

This connector **does not ask you to paste any API key**. It uses your Jotform account's browser sign-in:

1. Activate the connector in TerminalSync.
2. The `mcp-remote` bridge opens the Jotform login in your browser. The official docs describe it like this: *"You sign in to Jotform in your browser. Your AI tool then keeps the connection for you. You never paste a password or API key."*
3. You sign in and approve access. What the agent can see is bounded by your account: *"Your AI tool sees what your Jotform account can see. It cannot do more than your account can."*
4. To cut off access: **My Account → Connected Apps → Jotform MCP → Clients** → **Revoke**.

**Honest disclosure:** this is a **server hosted by Jotform** (`https://mcp.jotform.com`), not something that runs on your computer. Jotform MCP is free, but your Jotform plan limits still apply — *"Jotform MCP is free. Your Jotform plan limits still apply."* In organizations with workspaces, an admin must install Jotform before the team can connect it. And if you see an HTTP 429 error, you sent too many requests in a row: wait and try again.

--- dev ---

Jotform publishes its MCP server as a **remote/hosted server**, documented in the official repo `github.com/jotform/mcp-server` and at `jotform.com/developers/mcp`. There is no npm stdio package; the catalog bridge is the generic client pattern:

```
npx -y mcp-remote@latest https://mcp.jotform.com
```

Auth is **browser OAuth** — no API key or secret (mold B). Jotform has one main server and three product servers; the manifest uses the main one:

| Server | Address | Use it for |
| --- | --- | --- |
| Main server | `https://mcp.jotform.com` | Forms and responses, as text |
| Forms app | `https://mcp.jotform.com/mcp-app` | Forms and responses, with previews and tables (MCP Apps) |
| Sign app | `https://mcp.jotform.com/mcp-sign-v1` | Documents for signature |
| Apps app | `https://mcp.jotform.com/mcp-jotform-apps-v1` | Client portals and event apps |

Official tools of the main server (7, verbatim): `search`, `create_form`, `edit_form`, `fetch`, `get_submissions`, `assign_form`, `analyze_submissions`. Forms app: the main server's except `get_submissions`, plus `display_form`, `list_submissions`, `create_submission`, `get_embed_code`, `get_teams`. Sign app: `search`, `list_submissions`, `create_sign_document`, `edit_sign_document`, `display_sign_document`, `update_sign_document_content`, `get_signers`, `update_signer`, `send_for_signature`, `get_signing_status`, `get_signing_links`, `get_teams`. Apps app: `search`, `fetch`, `create_app`, `edit_app`, `get_teams`. Some names repeat across servers — `search` finds forms on the main server, documents on Sign, and apps on Apps — each tool operates on its own server's product.

Gotchas verbatim from the docs: *"Previews and tables only show in tools that support MCP Apps"*; in Claude, Forms/Sign/Apps are separate plugins and you must sign in with the same Jotform account in each one so they can share forms; the live tool list is queried with `tools/list` and you should always use the schema from the server you are connected to; organizations that limit connections require an admin to install Jotform; HTTP 429 when you send too many requests.

License: MIT (LICENSE of the official repo `github.com/jotform/mcp-server`). Source: README + `docs/mcp/endpoints.md` + `docs/mcp/tools.md` + `docs/mcp/authentication.md` from the official repo, read verbatim this run; product docs at `jotform.com/developers/mcp/?tab=mcp`.
