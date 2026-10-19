---
name: Typeform
logo: /connectors/typeform.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Your forms and surveys, handled by conversation"
simpleSubtitle: "Official Typeform MCP server: create and edit forms, automate follow-ups and read responses over OAuth."
devTitle: "Typeform MCP Connector"
devSubtitle: "Official hosted Typeform MCP (api.typeform.com/mcp) — forms, automations, contacts and insights."
ctaUrl: "https://www.typeform.com"
tokenHelpUrl: "https://www.typeform.com/developers/get-started/mcp/"
manifest:
  mcpServers:
    typeform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://api.typeform.com/mcp"]
affiliate: false
tagline: "Lead-capture forms, within reach of the agent"
originalAuthor: "Typeform"
originalAuthorUrl: "https://www.typeform.com/developers/get-started/mcp/"
license: "proprietary"
licenseUrl: "https://www.typeform.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-19T14:30:00.000Z"
verifiedPackageVersion: null
---
**Typeform** is the forms and surveys platform businesses use to capture leads, take orders and run customer research. The official Typeform connector is a **hosted MCP server** (`https://api.typeform.com/mcp`): in its own words, *"It exposes form and automation building, contact management, and response analytics over the Model Context Protocol"*.

What that means day to day: your agent can create and edit forms (fields, logic, publishing), build automations with email, webhook, delay and integration steps, manage contacts and lists — including bulk upsert with form field mapping — and query responses as data: raw submissions, aggregates, rankings and time series. The official list groups **67 tools** across accounts, forms, themes, insights, automations and contacts.

### What you can ask

- *"Create a contact form for my website with name, email and message fields, and publish it."*
- *"Add an email step to the lead automation that alerts the team when a new response comes in."*
- *"How many responses did my forms get this week, and which one converted best?"*
- *"Add these contacts to my newsletter list and map the form fields."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses OAuth with your Typeform account:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Typeform's login in your browser — authorization is OAuth 2.0 and the client presents itself on first connect: *"Authorization is OAuth 2.0, and your client is prompted on first connect"*.
3. Sign in and approve access. What the agent can see or do is bounded by your Typeform account and plan.

**Honest note:** this is a **server hosted by Typeform** (`https://api.typeform.com/mcp`), not something that runs on your computer. Access to each feature depends on your plan — *"Access to the underlying features is plan-dependent and enforced when a tool is called"*. Tools marked destructive (deleting a form or a contacts list) **cannot be undone**. And if your account is on the EU data center, your account uses Typeform's EU endpoints, not this one.

--- dev ---

Typeform publishes its MCP server as a **remote/hosted server**, documented at `typeform.com/developers/get-started/mcp/`. Endpoint: `https://api.typeform.com/mcp` (Streamable HTTP; the docs are explicit: *"Streamable HTTP only — there's no SSE endpoint, and clients configured for SSE fail immediately"*). There is no local stdio package; the catalog bridge is the generic client pattern:

```
npx -y mcp-remote@latest https://api.typeform.com/mcp
```

Auth is **OAuth 2.0**, and a hosted connector identifies itself with a *client metadata document*. EU-hosted accounts use different endpoints. Documented scopes: `accounts:read`, `workspaces:read`, `forms:read`/`forms:write`, `insights:read`, `automations:read`/`automations:write`, `contacts:read`/`contacts:write` and `webhooks:write` (for webhook automation steps). *"The tool list is the same for every account."*

Official tools (67 across 6 groups, verbatim from the official list): `forms-public_get_capabilities/get_form/list_forms/create_form/validate_patch/patch_form/publish_form/duplicate_form/update_form_metadata/delete_form`, `themes-public_list_themes` + `themes-get_theme/create_theme/update_theme`, `insights-public_discover/aggregate/timeseries/toplist/list`, `automations-public_*` (19: create/get/list_automations, add_email_step/add_webhook_step/add_delay_step/add_integration_step, publish/pause, patch_trigger, remove_steps/reorder_step, update_*_step), `contacts-public_*` (26: get/list contacts and database properties, create/update/delete_contact, bulk_upsert_contacts, create_contacts_list, import_form_responses_by_mapping, form property mappings), `accounts-list_accounts`, `workspaces-list_workspaces` and `submit_feedback`. First call: *"Call `accounts-list_accounts` first: nearly every other tool needs the `account_id` it returns"*; for insights, `insights-public_discover` resolves the schema and goes first. Form editing is patch-based and ordered.

Not supported via MCP (the docs point to the REST API): full response row export, legacy form-level webhooks, theme deletion and brand kit editing, workspace CRUD, embed code retrieval, automation deletion, account member management, and custom contact property renaming.

License: proprietary SaaS terms (Typeform Legal, `typeform.com/legal`). Source: typeform.com/developers/get-started/mcp/ + official tool list (`/developers/get-started/mcp/tools/`).
