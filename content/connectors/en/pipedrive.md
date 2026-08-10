---
name: Pipedrive
logo: /connectors/pipedrive.svg
category: automation
status: available
simpleTitle: "Your sales pipeline, one message away"
simpleSubtitle: "Official Pipedrive MCP: search deals, update records and read your pipeline, connected with your own login."
devTitle: "Pipedrive MCP Connector"
devSubtitle: "Official hosted Pipedrive MCP (mcp.pipedrive.ai) — CRM records and pipeline data through OAuth."
ctaUrl: "https://www.pipedrive.com"
tokenHelpUrl: "https://support.pipedrive.com/en/article/mcp"
manifest:
  mcpServers:
    pipedrive:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pipedrive.ai/mcp"]
affiliate: false
tagline: "Your deals and contacts, within reach of the agent"
originalAuthor: "Pipedrive"
originalAuthorUrl: "https://www.pipedrive.com/en/features/mcp-server"
license: "proprietary"
licenseUrl: "https://www.pipedrive.com/en/terms-of-service"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Pipedrive** is the CRM many small sales teams use to track deals from first contact to close — who's in the pipeline, what stage they're at, what's stalling. Pipedrive's own native MCP server, launched directly by Pipedrive, lets your agent read and update that pipeline in plain language — no API key to paste, just your own Pipedrive account login.

Ask *"Show me all open deals over $10K that haven't been updated in two weeks"* and it searches your pipeline for you. Say *"Move the Acme Corp deal to Proposal Sent and schedule a follow-up for Friday"* and it updates the deal and creates the activity. It's built for looking up deals, contacts and organizations, updating records, converting leads, and turning meeting notes into CRM records — in Pipedrive's own words, it can *"create a deal, contact and follow-up activity"* straight from a conversation.

### What you can ask

- *"Show me all open deals over $10K that haven't been updated in two weeks."*
- *"Move the Acme Corp deal to Proposal Sent and schedule a follow-up for Friday."*
- *"Create a deal, contact and follow-up activity from these meeting notes."*
- *"Which deals are stalling and need a nudge?"*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Pipedrive account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Pipedrive's login in your browser and asks you to sign in and authorize access.
3. Approve it with your account. In Pipedrive's own words: *"Your AI assistant can only access and modify data your Pipedrive user already has permission to view and edit"*, and every action gets recorded in Pipedrive's change log. Official setup docs are at [support.pipedrive.com](https://support.pipedrive.com/en/article/mcp).

**Honest note:** it's a server **hosted by Pipedrive** (`https://mcp.pipedrive.ai/mcp`), not something that runs on your computer. It's available on every Pipedrive plan, and usage draws from a token allowance included in your plan — Pipedrive sells additional tokens if you need more.

--- dev ---

Pipedrive publishes its **native MCP server** as a hosted endpoint at `https://mcp.pipedrive.ai/mcp`, announced by Pipedrive on June 30, 2026 (*"Pipedrive launches native MCP server, bringing CRM workflows directly into AI assistants"*) and documented at `support.pipedrive.com/en/article/mcp` (general overview) and `support.pipedrive.com/en/article/mcp-claude` (Claude-specific setup). There's no npm package or local install — TerminalSync bridges the hosted endpoint with:

```
npx -y mcp-remote@latest https://mcp.pipedrive.ai/mcp
```

Auth is OAuth against the user's own Pipedrive account (no client secret to store); Pipedrive's Claude setup guide walks through adding it as a custom connector (name, paste the endpoint URL), signing in, and approving the authorization pop-up.

Documented capabilities, verbatim from Pipedrive's own feature page and knowledge base: *"Search deals, contacts, organizations and leads. Retrieve pipeline details"*; *"Create and update deals, contacts and activities. Convert leads, schedule follow-ups"*; *"Turn meeting notes into CRM records, generate follow-up tasks"*; plus analyzing pipeline trends to flag stalling deals.

**Disclosure:** Pipedrive's own docs state access is scoped to what the connected user can already see and edit, and that *"all actions are recorded in the change log for full auditability."* The knowledge base also notes MCP access isn't automatic — an admin or the user has to explicitly grant it. Usage draws from a token allowance bundled with the account's plan; Pipedrive sells additional tokens separately.

License: proprietary SaaS terms (`pipedrive.com/en/terms-of-service`). Source: pipedrive.com/en/features/mcp-server, support.pipedrive.com/en/article/mcp, support.pipedrive.com/en/article/mcp-claude.
