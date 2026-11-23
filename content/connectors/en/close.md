---
name: Close
logo: /connectors/close.png
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Your Close sales CRM, managed by conversation"
simpleSubtitle: "Close's official MCP server: search leads, create opportunities and notes, draft emails, and follow your pipeline via OAuth with your Close account."
devTitle: "Close MCP connector"
devSubtitle: "Close's official hosted MCP (mcp.close.com/mcp) — 155 tools by scope: 74 read, 24 safe write, 57 destructive."
ctaUrl: "https://www.close.com"
tokenHelpUrl: "https://developer.close.com/mcp"
manifest:
  mcpServers:
    close:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.close.com/mcp"]
affiliate: false
tagline: "Your sales pipeline, within reach of your agent"
originalAuthor: "Close"
originalAuthorUrl: "https://developer.close.com/mcp"
license: "proprietary"
licenseUrl: "https://www.close.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-23T00:00:00.000Z"
verifiedPackageVersion: null
---
**Close** is the sales CRM small businesses use to run leads, pipeline, and all customer communication in one place. Close's official connector is a **hosted MCP server** (`https://mcp.close.com/mcp`): the official docs introduce it like this — *"Model Context Protocol (MCP) servers provide a standardized interface that allows any compatible AI model or agent to access your Close data in a simple and secure way."*

What that means in practice: your agent can search and read your leads, contacts, opportunities, tasks, notes, calls, meetings —with transcripts—, inbox emails and SMS; create leads, contacts, opportunities, notes, tasks, and comments; leave email and SMS drafts ready to review; and manage pipelines, templates, and saved views. The official reference groups **155 tools into 3 scopes**: 74 read-only (`mcp.read`), 24 safe write (`mcp.write_safe`), and 57 destructive (`mcp.write_destructive`) — *"Each higher scope includes all tools from the lower scopes."*

### What you can ask

- *"Show me the leads that have gone a week without a reply."*
- *"Create a note on the Acme lead with what we agreed on today's call."*
- *"How many opportunities did I close this month, and how much is open in the pipeline?"*
- *"Draft a follow-up email for the proposal lead."*

### How you connect

This connector **does not ask you to paste any API key**. It uses OAuth with your Close account in the browser:

1. Activate the connector in TerminalSync.
2. The `mcp-remote` bridge opens the Close login — the server supports *"OAuth 2.0 Dynamic Client Registration (DCR)"* per the official docs, so the client registers itself and takes you to the authorization screen.
3. You sign in, choose your Close organization and the permissions you grant the agent, and approve.
4. To cut off access, revoke the connection from Close like any connected app.

**Honest disclosure:** this is a **server hosted by Close** (`https://mcp.close.com/mcp`), not something that runs on your computer. The scope is bounded by what you approve in the OAuth flow: destructive tools —deleting leads, contacts, or opportunities, actually **sending** emails and SMS, merging leads— only come in if that write level is authorized. And to work with more than one organization, Close's docs require one connection per organization (in Claude they solve it with distinct URLs like `?1`, `?2`).

--- dev ---

Close publishes its MCP server as a **remote/hosted server**, documented at `developer.close.com/mcp` (tool reference at `developer.close.com/mcp/tools.md`). Endpoint: `https://mcp.close.com/mcp` with *"HTTP Streamable"* and *"OAuth 2.0 Dynamic Client Registration (DCR)"* support. There is no npm stdio package; the catalog bridge is the generic client pattern:

```
npx -y mcp-remote@latest https://mcp.close.com/mcp
```

The docs' recommended auth is **OAuth 2.0** (DCR + browser sign-in). Documented alternative for custom setups, via headers with an API key: `Close-API-Key: {{ Your Close API Key }}` + `Close-Scope: {{ mcp.read, mcp.write_safe, or mcp.write_destructive }}` — the `Close-Scope` header determines the scope and the available tools. The docs also document Close's official connector inside Claude (Settings → Connectors → Organization connectors) and the `?1`/`?2` URL suffix trick to connect several organizations in clients that reject two connections with the same address.

Official tools (155, verbatim IDs by scope). Read-only (`mcp.read`, 74): `lead_search`, `search`, `activity_search`, `find_leads`, `find_contacts`, `find_opportunities`, `find_tasks`, `find_notes`, `find_pipelines_and_opportunity_statuses`, `find_email_templates`, `find_sms_templates`, `find_smart_views`, `find_invoices`, `fetch_email`, `fetch_sms`, `fetch_meeting`, `fetch_meeting_transcript`, `fetch_invoice`, `show_lead`, `show_contact`, `show_opportunities`, `show_tasks`, `aggregate_objects`, `list_objects`, `org_info`, `org_users`, `get_billing_summary`, `get_voice_agents`, `render_email_template`, `render_sms_template`, `paginate_search`, `submit_feedback`, among the rest of the reference. Safe write (`mcp.write_safe`, 24): `create_lead`, `create_contact`, `create_opportunity`, `create_note`, `create_task`, `create_comment`, `create_draft_email`, `create_draft_sms`, `create_email_template`, `create_sms_template`, `create_pipeline`, `create_smart_view`, `create_workflow`, `log_call`, `rent_phone_number`, `pin_smart_view`, among the rest. Destructive (`mcp.write_destructive`, 57): `send_email`, `send_sms`, `merge_leads`, `delete_lead`, `delete_contact`, `delete_opportunity`, `delete_task`, `delete_note`, `update_lead`, `update_opportunity`, `update_meeting`, `bulk_update_tasks`, `enrich_field`, `cancel_email_send`, `cancel_sms_send`, `schedule_voice_agent_call`, among the rest. The full list per scope is in the official reference.

Gotchas verbatim from the reference: scopes are cumulative — *"Each higher scope includes all tools from the lower scopes"*; actually sending email/SMS, merging leads, and anything that deletes live in the destructive scope; `activity_search` returns results ordered by date descending and `paginate_search` brings the next page; `close_product_knowledge_search` searches Close's own documentation; `submit_feedback` exists to report server issues.

License: proprietary SaaS (`close.com/terms`). Source: `developer.close.com/mcp` + `developer.close.com/mcp/tools.md` (official markdown, read verbatim this run) + MCP registry (`com.close/close-mcp`).
