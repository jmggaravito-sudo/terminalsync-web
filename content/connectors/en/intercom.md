---
name: Intercom
logo: /connectors/intercom.svg
category: support
status: available
simpleTitle: "Ask your AI about your Intercom inbox"
simpleSubtitle: "Official Intercom MCP: search conversations, contacts, companies and help articles over OAuth, no token to paste."
devTitle: "Intercom MCP Connector"
devSubtitle: "Official hosted Intercom MCP (mcp.intercom.com) — conversations, contacts, companies and articles through OAuth."
ctaUrl: "https://www.intercom.com"
tokenHelpUrl: "https://developers.intercom.com/docs/guides/mcp"
manifest:
  mcpServers:
    intercom:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.intercom.com/mcp"]
affiliate: false
tagline: "Your Intercom inbox, within reach of the agent"
originalAuthor: "Intercom"
originalAuthorUrl: "https://developers.intercom.com/docs/guides/mcp"
license: "proprietary"
licenseUrl: "https://www.intercom.com/legal/terms-and-policies"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-09-19T12:19:33.156Z"
verifiedPackageVersion: null
---
**Intercom** is the messaging and support inbox many businesses use to talk to their customers. The official Intercom MCP server lets your agent look through that workspace — conversations, contacts, companies and help-center articles — with no token pasted into TerminalSync, just your own Intercom login.

Ask *"Find the conversations from this customer and summarize the problem"* and the agent searches your inbox and reads them. Ask *"Which help articles do we have about refunds?"* and it searches your help center. It is mostly a **reading** connector: it can also leave **internal notes** (only your teammates see them) and create or edit **help-center articles**, but it **cannot reply to a customer** — that part stays with you in Intercom.

### What you can ask

- *"Search the conversations from ana@company.com and summarize what she needs."*
- *"Read this conversation and tell me what the customer is asking for."*
- *"Find the contact for this email and show me which company they belong to."*
- *"List my help-center articles and find the ones about shipping."*
- *"Add an internal note to this conversation saying we'll call them tomorrow."*
- *"Draft a help-center article about our returns policy."*

### How you connect

This connector **doesn't ask you to paste a token**. It uses your own Intercom login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Intercom's login in your browser and asks you to authorize access.
3. Approve it with your account. Intercom's own guide is at [developers.intercom.com](https://developers.intercom.com/docs/guides/mcp).

**Honest note:** this is a server **hosted by Intercom** (`https://mcp.intercom.com/mcp`), not something that runs on your computer. Intercom documents it for **US-hosted and EU-hosted workspaces only** (EU uses a different address, `mcp.eu.intercom.com`, which this connector does not use), and **Australia-hosted workspaces aren't supported**. The three write actions are internal notes and creating or updating articles; articles can be seen by your customers, so review before publishing. Intercom's page doesn't list plan or role requirements, so if the login fails, check with your Intercom admin.

--- dev ---

Intercom publishes an official **remote MCP server** at `https://mcp.intercom.com/mcp` (US workspaces; EU at `https://mcp.eu.intercom.com/mcp`; AU-hosted workspaces unsupported), documented at `developers.intercom.com/docs/guides/mcp`. Transport is Streamable HTTP (the `/sse` endpoints are deprecated). Auth is **OAuth** (the authorization server advertises dynamic client registration at `/register` with PKCE S256); bearer-token auth is also documented but this connector uses the OAuth path. TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.intercom.com/mcp
```

Tools (14, per the official page): **read-only** `search`, `fetch`, `search_conversations`, `get_conversation`, `search_contacts`, `get_contact`, `list_companies`, `get_company`, `list_articles`, `search_articles`, `get_article`; **write** `create_article`, `update_article`, `add_internal_note` (attributed to the admin who authorized the connection). A 401 on `add_internal_note` usually means the connection predates the write scope and must be reconnected.

License: proprietary SaaS terms (`intercom.com/legal/terms-and-policies`). Source: developers.intercom.com/docs/guides/mcp.
