---
name: Typeform
logo: /connectors/typeform.svg
category: automation
status: available
simpleTitle: "Build, publish and read your Typeform forms by asking"
simpleSubtitle: "Official Typeform MCP: forms, automations and contacts over OAuth, no API key to paste."
devTitle: "Typeform MCP Connector"
devSubtitle: "Official hosted Typeform MCP (api.typeform.com/mcp) — forms, automations, contacts and insights through OAuth."
ctaUrl: "https://www.typeform.com"
tokenHelpUrl: "https://www.typeform.com/developers/get-started/mcp/"
manifest:
  mcpServers:
    typeform:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://api.typeform.com/mcp"]
affiliate: false
tagline: "Your forms and contacts, within reach of the agent"
originalAuthor: "Typeform"
originalAuthorUrl: "https://www.typeform.com/developers/get-started/mcp/"
license: "proprietary"
licenseUrl: "https://www.typeform.com/legal/service-terms-and-conditions"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Typeform** is the tool for building forms and surveys people actually finish — lead capture, event registration, feedback, quizzes. The official Typeform MCP server lets your agent build and publish forms, manage the contacts they collect, and set up simple automations directly from your own Typeform account — no API key pasted into TerminalSync, just your own login.

Ask *"Create a new lead-capture form for the fall promo"* and the agent creates it in your workspace, ready to edit. Ask *"List everyone who filled out the event registration form"* and it pulls the contacts straight from Typeform. It's built for creating and publishing forms, keeping the contacts they collect organized, and wiring up automations like an email step after someone responds.

### What you can ask

- *"Create a new form for collecting customer feedback."*
- *"Publish the fall promo form so it's live."*
- *"List all the forms in my workspace."*
- *"Add an email step to the automation on my signup form."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Typeform account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Typeform's login in your browser and asks you to authorize access, scoped to what each action needs (forms, automations, contacts).
3. Approve it with your account — the connector can only see and do what that account is allowed to. Typeform's own setup guide is at [typeform.com/developers](https://www.typeform.com/developers/get-started/mcp/).

**Honest note:** this is a server **hosted by Typeform** (`https://api.typeform.com/mcp`), not something that runs on your computer. Typeform itself describes it as a *"generally-available beta with limited capabilities"* that they're still extending — some features you'd expect may not be there yet, and what's available today can depend on your Typeform plan.

--- dev ---

Typeform publishes an official **remote MCP server** at `https://api.typeform.com/mcp`, documented at `typeform.com/developers/get-started/mcp/`. EU data-center accounts use `https://api.eu.typeform.com/mcp` or `https://api.typeform.eu/mcp` instead. Transport is **streamable HTTP only** — Typeform's docs state there's no SSE endpoint. Auth is OAuth against the user's Typeform account, with per-tool scopes (e.g. `forms:read`, `forms:write`, `automations:write`, `contacts:read`, `contacts:write`, `insights:read`, `accounts:read`, `workspaces:read`).

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://api.typeform.com/mcp
```

Typeform's docs publish a full, versioned tool table (60+ tools) grouped by namespace — verbatim examples: `forms-public_create_form`, `forms-public_patch_form` (requires a `validation_token` from `forms-public_validate_patch`), `forms-public_publish_form`, `automations-public_create_automation`, `automations-public_add_email_step`, `contacts-public_bulk_upsert_contacts`, `contacts-public_list_contacts_lists`, `insights-public_discover`, `workspaces-list_workspaces`. Typeform's own docs note *"we'll be extending its capabilities over the next few months"* and that insight tools are still limited (*"Tools for getting form insights will be coming soon!"*). Feature access is also gated by the caller's Typeform subscription plan.

License: proprietary SaaS terms (`typeform.com/legal/service-terms-and-conditions`). Source: typeform.com/developers/get-started/mcp/.
