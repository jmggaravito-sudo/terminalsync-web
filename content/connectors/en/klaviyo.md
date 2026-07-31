---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Run your email and SMS marketing by asking"
simpleSubtitle: "Official Klaviyo MCP: campaigns, flows, profiles and reporting over OAuth."
devTitle: "Klaviyo MCP Connector"
devSubtitle: "Official hosted Klaviyo MCP (mcp.klaviyo.com) — campaigns, flows, profiles and reporting through OAuth."
ctaUrl: "https://klaviyo.com"
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
licenseUrl: "https://www.klaviyo.com/legal/api-terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** is the email and SMS marketing platform ecommerce businesses use to run campaigns, automated flows, and customer segments. The official Klaviyo MCP server lets your agent check performance and build campaigns directly — no API key pasted into TerminalSync, just your own Klaviyo account login.

Ask *"Show me the performance of my email campaigns from the last 30 days"* and the agent pulls the numbers from your account. Ask *"Create an email campaign promoting our Memorial Day sale"* and it drafts it against your real lists and templates. It's built for reviewing campaign and flow performance, managing profiles and segments, and drafting new campaigns.

### What you can ask

- *"Show me the performance of my email campaigns from the last 30 days."*
- *"Which flows are performing the best in terms of conversions?"*
- *"Create an email campaign promoting our Memorial Day sale."*
- *"Find this customer's profile and add them to the VIP segment."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Klaviyo account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Klaviyo's login in your browser and asks you to authorize access (OAuth with dynamic client registration).
3. Approve it with your account — the connector only sees and does what your role allows. Klaviyo's own docs are at [developers.klaviyo.com](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server).

**Honest note:** this is a server **hosted by Klaviyo** (`https://mcp.klaviyo.com/mcp`), not something that runs on your computer. Klaviyo's docs state this server is **only available to users with an Owner, Admin, or Manager role** on the account, and it can create and send real campaigns — review before sending.

--- dev ---

Klaviyo publishes an official **remote MCP server** at `https://mcp.klaviyo.com/mcp`, documented at `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. Auth is **OAuth with dynamic client registration** (a local variant also exists, authenticated with a private API key via env var, but this connector uses the official hosted OAuth path). TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

The docs enumerate 40+ tools across Accounts, Campaigns, Catalogs, Events, Flows, Groups (Lists & Segments), Images, Profiles, Reporting, Templates, and Translations (beta) — e.g. `get_campaigns`, `create_campaign`, `get_flows`, `get_profiles`, `update_profile`, `get_campaign_report`, `create_email_template`. The remote server supports query-param modes documented by Klaviyo: `read-only`, `core-tools-only` (defaults to `true` for ChatGPT), `disable-tools-with-user-generated-content`, `include-output-schemas`, and `beta`. Klaviyo's docs restrict full access to Owner/Admin/Manager account roles.

License: proprietary SaaS terms (`klaviyo.com/legal/api-terms`). Source: developers.klaviyo.com/en/docs/klaviyo_mcp_server.
