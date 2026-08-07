---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Ask your Klaviyo marketing data in plain language"
simpleSubtitle: "Official Klaviyo server: campaigns, flows, profiles, segments, and performance reports."
devTitle: "Klaviyo MCP Connector"
devSubtitle: "Official hosted Klaviyo MCP (mcp.klaviyo.com) — email/SMS marketing over OAuth."
ctaUrl: "https://www.klaviyo.com"
tokenHelpUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
manifest:
  mcpServers:
    klaviyo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.klaviyo.com/mcp"]
affiliate: false
tagline: "Your email and SMS marketing, within reach of the agent"
originalAuthor: "Klaviyo"
originalAuthorUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
license: "proprietary"
licenseUrl: "https://www.klaviyo.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** is the email and SMS marketing platform ecommerce and retail businesses use to run campaigns, automated flows, and customer segments. The official Klaviyo connector is a **hosted MCP server** that lets your agent read and act on your Klaviyo account in plain language — campaign performance, flow results, customer profiles, and templates — without you digging through dashboards.

Ask *"Show me the performance of my email campaigns from the last 30 days"* and it pulls the reporting data. Say *"Create an email campaign promoting our Memorial Day sale"* and it can draft one directly in your account. It's for checking what's working, building new campaigns and segments, and keeping templates and customer lists up to date.

### What you can ask

- *"Show me the performance of my email campaigns from the last 30 days."*
- *"Which flows are performing the best in terms of conversions?"*
- *"Create an email campaign promoting our Memorial Day sale."*
- *"List my customer segments and how many profiles are in each one."*

### How you connect

This connector **doesn't ask you to paste any API key**. It uses your own Klaviyo account login:

1. When you enable it, a browser window opens for you to sign in to Klaviyo and authorize access (OAuth).
2. You approve the permissions with your account — the connector can only see and do what that account is allowed to.
3. That's it: no token to copy or renew by hand. Klaviyo's official connection guide is at [developers.klaviyo.com](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server).

**Honest note:** it's a server **hosted by Klaviyo** (it doesn't run on your computer). Locally you use the `mcp-remote` bridge, which opens the OAuth flow and keeps the connection to `https://mcp.klaviyo.com/mcp`. Klaviyo's own docs state this feature is only available to accounts with the **Owner, Admin, or Manager** role — a teammate with a more limited role won't be able to authorize it. What the agent can see or change beyond that is bounded by your account's permissions.

--- dev ---

Klaviyo publishes an official **remote/hosted MCP server** at `https://mcp.klaviyo.com/mcp`, described in the docs as the recommended approach over a local option. The official source is `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. There's no static local stdio command for this connector: you connect to the hosted URL and bridge it locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

Auth for the remote server is **OAuth with dynamic client registration** — the browser-based flow `mcp-remote` opens is the same shape as any other OAuth connector here, so the manifest declares no `env`/secret. Klaviyo also documents a **local** alternative (`uvx klaviyo-mcp-server@latest`) that instead takes a private API key with per-scope permissions (Accounts, Campaigns, Catalogs, Events, Flows, Images, List, Metrics, Profiles, Segments, Subscriptions, Tags, Templates, Translations) via a `PRIVATE_API_KEY` env var — TerminalSync ships the hosted OAuth path so no API key needs to be pasted or rotated by hand.

**Role gate, verbatim from the docs:** *"This feature is only available to Klaviyo users with an Owner, Admin, or Manager role."*

**Tools (40+ across categories, per the docs):** Accounts (account details), Campaigns (list/create/get details, assign templates), Catalogs (list items), Events (list/create events, query metrics), Flows (list flows, get details), Groups/Lists/Segments management, Images (upload from file or URL), Profiles (create/update/list/subscribe/unsubscribe), Reporting (campaign and flow performance reports), Templates (create/update/delete/clone email templates), Translations (create/update/delete translation collections).

Klaviyo doesn't publish an open-source repo or LICENSE for the hosted server — treated as proprietary SaaS terms, same pattern as Zapier/Ideogram/Asana in this catalog. Source: developers.klaviyo.com.
