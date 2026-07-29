---
name: Zapier
logo: /connectors/zapier.svg
category: automation
status: available
simpleTitle: "Give your agent actions across thousands of apps"
simpleSubtitle: "Official Zapier MCP: Gmail, Slack, Sheets, CRMs and 9,000+ apps through your Zapier account."
devTitle: "Zapier MCP Connector"
devSubtitle: "Official Zapier MCP server — user-managed tools and app connections from mcp.zapier.com."
ctaUrl: "https://mcp.zapier.com"
tokenHelpUrl: "https://mcp.zapier.com"
affiliate: false
tagline: "Thousands of app actions, within reach of the agent"
originalAuthor: "Zapier"
originalAuthorUrl: "https://github.com/zapier/zapier-mcp"
license: "proprietary"
licenseUrl: "https://zapier.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Zapier MCP** is the bridge from your agent to the apps you already use: Gmail, Google Sheets, Slack, Salesforce, HubSpot, Asana, and thousands more. Unlike a single-product connector, Zapier lets you choose exactly which actions are exposed to your AI — send an email, add a spreadsheet row, create a task, update a CRM deal, or trigger one of the tools you have enabled in your Zapier MCP server.

Ask *"Create an Asana task for this client follow-up and add the lead to my Google Sheet"* and the agent can call the Zapier tools you allowed. It works best when you keep the server focused: only enable the actions you actually want the agent to use.

### What you can ask

- *"Add this new lead to Google Sheets and create a follow-up task."*
- *"Send this approved message through Gmail."*
- *"Create a Slack channel for this project and invite the team."*
- *"Find this contact in HubSpot and update the deal stage."*

### How you connect

Zapier's setup is managed in **your Zapier MCP dashboard**, not by a fixed public manifest:

1. Go to [mcp.zapier.com](https://mcp.zapier.com) and create or open your MCP server.
2. Add the app actions you want the agent to have.
3. Connect the MCP URL/credentials Zapier gives you to your AI client.

**Honest note:** Zapier actions can change real systems. Keep the tool list narrow, use read-only/search tools where possible, and require approval before sending messages, editing records, or triggering business workflows. Zapier documents that MCP usage consumes tasks from your existing Zapier plan.

--- dev ---

Zapier publishes official MCP documentation at `mcp.zapier.com` and the `zapier/zapier-mcp` GitHub repo. The MCP server is user/account managed: the user generates credentials or a server URL in Zapier, adds tools/actions, and the client connects to that server. That means TerminalSync does **not** ship a single static `mcpServers` manifest for all users here — the correct URL and enabled tools are determined by the user's Zapier MCP server.

Zapier positions the product as access to thousands of app connections and tens of thousands of actions. Zapier's docs also state that each successful MCP tool call consumes tasks from the user's existing Zapier plan, and that server/tool access is controlled from the Zapier MCP dashboard.

License: proprietary SaaS terms. Source: zapier.com/mcp, help.zapier.com MCP docs, and github.com/zapier/zapier-mcp.
