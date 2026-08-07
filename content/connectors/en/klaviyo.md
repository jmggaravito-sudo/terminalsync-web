---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Your email/SMS marketing, run from chat"
simpleSubtitle: "Official Klaviyo MCP server: campaigns, flows, segments and reporting over OAuth."
devTitle: "Klaviyo MCP Connector"
devSubtitle: "Official hosted Klaviyo MCP (mcp.klaviyo.com) — campaigns, flows, profiles, and reporting."
ctaUrl: "https://www.klaviyo.com"
tokenHelpUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
manifest:
  mcpServers:
    klaviyo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.klaviyo.com/mcp"]
affiliate: false
tagline: "Your campaigns and flows, within reach of the agent"
originalAuthor: "Klaviyo"
originalAuthorUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
license: "proprietary"
licenseUrl: "https://www.klaviyo.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** is the email/SMS platform ecommerce brands use to run campaigns, automated flows, and segmented lists. The official Klaviyo connector is a **hosted MCP server** (`https://mcp.klaviyo.com/mcp`), published by Klaviyo, that lets your agent work with campaigns, flows, profiles, segments, and reporting directly through your own Klaviyo account.

Ask *"How did last week's abandoned-cart flow perform?"* and it pulls the reporting for that flow. Say *"Draft a campaign for the weekend sale targeting customers who haven't ordered in 30 days"* and it can build the draft against your real segments and templates. Usage runs against your Klaviyo account and role.

### What you can ask

- *"How did last week's abandoned-cart flow perform, and where are people dropping off?"*
- *"Draft a campaign for the weekend sale, targeted at customers who haven't ordered in the last 30 days."*
- *"List my active segments and how many profiles are in each one."*
- *"Pull the open and click rates for our last 3 campaigns."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Klaviyo account:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Klaviyo's OAuth flow in your browser and registers the client automatically — no manual app setup.
3. Sign in and authorize access. Klaviyo's own docs note this feature is available only to accounts with an **Owner, Admin, or Manager** role.

**Honest note:** this is a **hosted server run by Klaviyo** (`https://mcp.klaviyo.com/mcp`). What the agent can read or change is bounded by your account role's permissions in Klaviyo.

--- dev ---

Klaviyo publishes its MCP server as a **remote/hosted server** at `https://mcp.klaviyo.com/mcp`, documented at `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. There's no `npx`-installable local package for the recommended path — you connect to the hosted URL and bridge locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

Auth is **OAuth with Dynamic Client Registration** (the client registers itself against the remote server — no manual OAuth app to create beforehand). The official docs also document a **local server** mode (via `uv`, authenticated with a private API key) for developers who prefer a stdio process instead of the hosted endpoint; TerminalSync uses the hosted/OAuth path since it matches the "connect with one button" flow the catalog favors for non-technical owners.

Tool categories, verbatim from the official docs: **Accounts, Campaigns, Catalogs, Events, Flows, Groups, Images, Profiles, Reporting, Templates, Translations** — covering campaign creation, performance reporting, profile/segment management, and template rendering. The docs also flag one client-side limitation: *"Query parameters can't be controlled with the listed Claude connector or the listed ChatGPT app. To use them, set up a custom connector instead."*

**Access requirement:** per Klaviyo's docs, the MCP server *"is only available to Klaviyo users with an Owner, Admin, or Manager role"* — a Klaviyo seat with lower permissions won't be able to authorize the connector.

License: proprietary SaaS terms (Klaviyo Terms of Service). Source: developers.klaviyo.com/en/docs/klaviyo_mcp_server.
