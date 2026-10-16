---
name: Brevo
logo: /connectors/brevo.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Ask your email marketing and your CRM in plain language"
simpleSubtitle: "Official Brevo MCP: contacts, email campaigns, reports, SMS, WhatsApp and CRM deals, straight from your account."
devTitle: "Brevo MCP Connector"
devSubtitle: "Official hosted Brevo MCP (mcp.brevo.com) — 27 modules over your Brevo account: contacts, campaigns, analytics, SMS, WhatsApp and CRM, with a Bearer MCP token."
ctaUrl: "https://www.brevo.com"
tokenHelpUrl: "https://app.brevo.com"
manifest:
  mcpServers:
    brevo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.brevo.com/v1/brevo/mcp", "--header", "Authorization:${BREVO_AUTH_HEADER}"]
      env:
        BREVO_AUTH_HEADER: "Bearer ${SECRET:BREVO_MCP_TOKEN}"
affiliate: false
tagline: "Your email, SMS and CRM, within reach of the agent"
originalAuthor: "Brevo"
originalAuthorUrl: "https://developers.brevo.com"
license: "proprietary"
licenseUrl: "https://www.brevo.com/legal/termsofuse/"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:42:20.694Z"
verifiedPackageVersion: null
---
**Brevo** is the platform many small businesses run their marketing on: email campaigns, contacts and lists, SMS and WhatsApp messages, and a built-in CRM with deals, companies and tasks. The official Brevo connector is a **hosted MCP server** (`https://mcp.brevo.com/v1/brevo/mcp`), published by Brevo on its developer portal — in the official docs' words, it *"lets you use AI assistants to interact with your Brevo account using natural language."*

Ask *"How many contacts do I have?"* and the answer comes straight from your account. *"Show me the deals in the Negotiation stage"* pulls them from your CRM. It also does the work for you: *"Create an email campaign for my product launch"* or *"Add a contact to my newsletter list"* — those are Brevo's own documented example requests, and this connector can run them for real.

### What you can ask

- *"How many contacts do I have, and how are they split across my lists?"*
- *"How did my last email campaign perform?"*
- *"Show me the deals in the Negotiation stage."*
- *"Add María García (maria@example.com) to my newsletter list."*
- *"Create an email campaign for my Black Friday sale."*
- *"Create an SMS campaign to announce this weekend's flash sale."*

For anything that changes your account — adding a contact, creating a campaign — the AI shows you what it's about to do and asks for your confirmation before running it.

### What token you need

You need a **Brevo MCP token** — an API key type Brevo created specifically for its MCP server.

1. Sign in at [app.brevo.com](https://app.brevo.com) and go to **Account > SMTP & API > API Keys**.
2. Click **Generate a new API key** and switch on the **Create MCP server API key** option.
3. Copy the token right away. The official guide's warning, verbatim: *"Copy your token immediately and store it securely. It grants full read/write access to your account."*
4. Paste it when TerminalSync asks for `BREVO_MCP_TOKEN`. It's stored encrypted in the app's Secrets and sent to the server as the `Authorization: Bearer …` header.

**Honest disclosure:** this is a **server hosted by Brevo** (`mcp.brevo.com`), not something that runs on your computer — your requests travel to Brevo's server, which answers with data from your account. The token has **no scopes**: Brevo's guide says it grants full read/write access, so the agent can read and change everything your account can — create and send campaigns, modify contacts and lists, touch your CRM. The docs describe no server-side confirmation step. If you want a narrower surface, Brevo publishes 27 individual module servers (contacts only, email campaign management only, and so on); this connector ships the main server with everything combined.

--- dev ---

Brevo publishes its **official MCP** as a remote/hosted server at `https://mcp.brevo.com/v1/brevo/mcp` — *"All features combined (27 modules)"* — documented at `developers.brevo.com` (`docs/mcp-protocol` and `docs/integration-guide`). There's no npm package and no local stdio server; it's bridged with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.brevo.com/v1/brevo/mcp --header "Authorization:${BREVO_AUTH_HEADER}"
```

**Auth: Bearer token.** The `Authorization` header carries a Brevo MCP token, exactly as the integration guide shows (`"Authorization: Bearer ${BREVO_MCP_TOKEN}"`). The guide is picky about the format: *"Ensure the `Authorization` header value is formatted as `Bearer <token>` with a space between Bearer and the token."* Per Brevo's changelog, *"MCP tokens are no longer passed in the URL"* — the old `/{token}` URL patterns are no longer valid, and the header is the only documented auth. This card's manifest injects the token from the app's Secrets as `${SECRET:BREVO_MCP_TOKEN}` inside that header. The token is created at app.brevo.com → **Account > SMTP & API > API Keys** → **Generate a new API key** with the **Create MCP server API key** toggle on.

**Toolset.** From the changelog: *"The 193 MCP tools are now automatically generated from the Brevo OpenAPI specification"* — generated from the API's own OpenAPI spec, which Brevo says eliminates *"discrepancies between the API and MCP server."* The docs don't publish a flat tool list; they document modules and example requests (*"How many contacts do I have?"*, *"Create an email campaign for my product launch"*, *"Show me deals in the Negotiation stage"*, *"Add a contact to my newsletter list"*).

**The 27 documented modules**, each also served as its own focused server at `https://mcp.brevo.com/v1/<module>/mcp` (the docs note that a smaller toolset *"can improve response quality"* — swap the URL in the bridge to narrow the agent's surface):

| Module server | What it covers (Brevo's description) |
| ------------------------------- | ------------------------------------ |
| `brevo_contacts` | Manage contacts and lists |
| `brevo_email_campaign_management` | Create and manage email campaigns |
| `brevo_campaign_analytics` | View campaign performance |
| `brevo_templates` | Manage email templates |
| `brevo_transac_templates` | Manage transactional email templates |
| `brevo_deals` | Manage CRM deals |
| `brevo_companies` | Manage CRM companies |
| `brevo_tasks` | Manage CRM tasks |
| `brevo_pipelines` | Configure CRM pipelines |
| `brevo_notes` | Add notes to contacts and deals |
| `brevo_sms_campaigns` | Create and send SMS campaigns |
| `brevo_whatsapp_campaigns` | Create and send WhatsApp campaigns |
| `brevo_whatsapp_management` | Configure WhatsApp settings |
| `brevo_lists` | Manage contact lists |
| `brevo_segments` | Manage contact segments |
| `brevo_attributes` | Manage contact attributes |
| `brevo_contact_import_export` | Import and export contacts in bulk |
| `brevo_folders` | Organize campaigns into folders |
| `brevo_groups` | Manage contact groups |
| `brevo_senders` | Manage sender identities |
| `brevo_domains` | Manage sender domains |
| `brevo_ips` | Manage dedicated IPs |
| `brevo_accounts` | Manage account and sub-accounts |
| `brevo_users` | Manage users and permissions |
| `brevo_webhooks_management` | Configure webhooks |
| `brevo_external_feeds` | Manage RSS feeds |
| `brevo_processes` | Monitor background processes |

**Clients and requirements.** The docs list Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Cline *"and more"*; the bridge path requires Node.js on your machine (*"npx is required for Claude Desktop and Claude Code, which use the mcp-remote bridge"*). Brevo also publishes a separate **documentation MCP server** at `developers.brevo.com/_mcp/server` for searching its developer docs — a different server, not part of this connector.

**Limits.** The changelog notes *"Request limits have been added to protect services from abuse"*; no specific numbers are published.

**Disclosure:** a hosted server (not local) reached with a token that grants full read/write access, with no scopes and no documented server-side confirmation gate — control stays with the client orchestrating the tools.

License: proprietary SaaS (Brevo's Terms of Use, `brevo.com/legal/termsofuse`). Source: developers.brevo.com — Brevo MCP docs (`mcp-protocol`, `integration-guide`) and changelog.
