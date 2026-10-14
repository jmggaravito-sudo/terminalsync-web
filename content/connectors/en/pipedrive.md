---
name: Pipedrive
logo: /connectors/pipedrive.png
category: automation
status: available
simpleTitle: "Your sales pipeline, handled in plain language"
simpleSubtitle: "Official Pipedrive MCP server: search, create and update deals, contacts and follow-ups over OAuth."
devTitle: "Pipedrive MCP Connector"
devSubtitle: "Official hosted Pipedrive MCP (mcp.pipedrive.ai/mcp) — deals, contacts, organizations, leads, activities, notes."
ctaUrl: "https://www.pipedrive.com"
tokenHelpUrl: "https://support.pipedrive.com/en/article/mcp"
manifest:
  mcpServers:
    pipedrive:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pipedrive.ai/mcp"]
affiliate: false
tagline: "Your pipeline, within reach of the agent"
originalAuthor: "Pipedrive"
originalAuthorUrl: "https://www.pipedrive.com/en/features/mcp-server"
license: "proprietary"
licenseUrl: "https://www.pipedrive.com/en/terms-of-service"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-12T14:38:42.430Z"
verifiedPackageVersion: null
---
**Pipedrive** is the CRM built around a visual sales pipeline: deals move stage by stage until they close. The official Pipedrive connector is a **hosted MCP server** (`https://mcp.pipedrive.ai/mcp`), built and maintained by Pipedrive, that lets your agent search and update your deals, contacts, organizations and leads using the permissions of your own Pipedrive user.

Ask *"Show me all open deals that haven't been updated in two weeks"* and it checks your pipeline for you. Paste *"Here are my notes from today's call"* and it can create the deal, the contact and the follow-up activity in one go. It's for the routine part of keeping a CRM up to date — the part every sales team eventually abandons — without opening the dashboard.

### What you can ask

- *"Show me all open deals that haven't been updated in two weeks."*
- *"Which deals are most likely to close this month, and what are the next steps?"*
- *"Here are my notes from today's call. Create a deal, contact, and follow-up activity."*
- *"Move the [company name] deal to the [stage name] stage and schedule a follow-up for [date]."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Pipedrive account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Pipedrive's OAuth login in your browser — you sign in and click *"Allow and install"*.
3. The agent can only access and modify data your Pipedrive user already has permission to view and edit, and every action is recorded in Pipedrive's change log.

**Honest note:** this is a **hosted server run by Pipedrive** (`https://mcp.pipedrive.ai/mcp`), not something that runs on your computer. It's in beta and available to all Pipedrive customers, on every plan; usage is subject to token limits based on your plan, and you can purchase additional tokens if needed.

--- dev ---

Pipedrive publishes its MCP server as a **remote/hosted server** at `https://mcp.pipedrive.ai/mcp`, documented at `pipedrive.com/en/features/mcp-server` and `support.pipedrive.com/en/article/mcp` (with a published tools reference). There's no local stdio package — you connect to the hosted URL and bridge locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.pipedrive.ai/mcp
```

Auth is **OAuth with browser sign-in** — per the official setup guide, you sign in to Pipedrive and click *"Allow and install"*; access is then granted *"in accordance with your existing user permissions"*. No API key, no custom app to register. Pipedrive states the server *"works with any AI assistant that supports custom MCP connections"*.

Tools, per the official tools reference (`support.pipedrive.com/en/article/mcp-tools`), follow a naming pattern: `get*` (fetch a list), singular `get*` (fetch one record), `add*` (create), `update*` (edit) and `search*` (find by keyword) — over **activities, deals, persons (contacts), organizations, leads, products and notes**, plus `getStages`/`getStage` for pipeline stages and `convertLeadToDeal`/`getLeadConversionStatus` for lead conversion.

Disclosures: the server is hosted by Pipedrive; the agent *"can only access and modify data your Pipedrive user already has permission to view and edit"*; *"All actions are recorded in the change log for full auditability"*; *"MCP does not automatically grant access to your Pipedrive data"* — AI applications can act *"only when explicitly permitted by the user or administrator"*. Available to all customers on every plan; *"Usage is subject to token limits based on your plan and you can purchase additional tokens if needed"*.

License: proprietary SaaS terms (Pipedrive Terms of Service, `pipedrive.com/en/terms-of-service`). Sources: pipedrive.com/en/features/mcp-server, support.pipedrive.com/en/article/mcp, support.pipedrive.com/en/article/mcp-claude, support.pipedrive.com/en/article/mcp-tools.
