---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Let your AI work with your Webflow site"
simpleSubtitle: "Query sites, collections and CMS items using a token stored as a secret."
devTitle: "Webflow MCP Server"
devSubtitle: "Official Webflow MCP server over the Webflow Data API and Designer bridge."
ctaUrl: "https://developers.webflow.com/data/v2.0.0/docs/ai-tools"
tokenHelpUrl: "https://webflow.com/dashboard/account/integrations"
manifest:
  mcpServers:
    webflow:
      command: npx
      args: ["-y", "webflow-mcp-server"]
      env:
        WEBFLOW_TOKEN: "${SECRET:WEBFLOW_TOKEN}"
affiliate: false
tagline: "Webflow and CMS from chat"
originalAuthor: "Webflow"
originalAuthorUrl: "https://webflow.com"
license: "MIT"
licenseUrl: "https://unpkg.com/webflow-mcp-server@1.0.0/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Webflow** is one of the most widely used visual website builders — hand-designed pages, CMS collections, e-commerce, all managed without code. If your site (or a client's) runs on Webflow, this connector lets your AI read and edit the content directly, without you opening the panel.

Scope ranges from the simplest — *"update the home page title"* — to juicier things like managing CMS collections (blog posts, realtor properties, products), answering with real-time site data, or auditing SEO across every page at once.

### What you can ask

- *"List every blog post published in the last 30 days and tell me which ones are under 500 words."*
- *"Update the meta description on the pricing page to this text: [...]"*
- *"Create a new item in the 'Case Studies' collection with this data: title X, client Y, summary Z."*

### What token you need

You need a **Webflow API token** (Site Token or Workspace Token, depending on whether you want scope of a specific site or your entire account).

1. Go to [webflow.com/dashboard/account/integrations](https://webflow.com/dashboard/account/integrations) (or `Workspace Settings → Integrations → API Access` from your site).
2. Generate a new token — Webflow lets you pick scopes (CMS read, CMS write, Sites read, etc.). To start, give it CMS read + Sites read; add write when you need it.
3. Copy and paste it when the Lab asks for `WEBFLOW_TOKEN`. The token is never stored as plaintext on disk — it travels encrypted in your Keychain.

Important: if you want visual editing with the Designer bridge (editing page elements, not just CMS), Webflow has an extra component documented in their [official AI tools guide](https://developers.webflow.com/data/v2.0.0/docs/ai-tools). This connector covers the standard Data API mode.

--- dev ---

`webflow-mcp-server` is the package published by Webflow to run the MCP server locally with `npx`. In local install it uses `WEBFLOW_TOKEN` to authenticate against the Webflow Data API; Webflow's docs also describe a remote OAuth mode via `mcp-remote`.

The token can be a Site Token (scope: a specific site) or a Workspace Token (scope: the entire workspace). Individual scopes — `sites:read`, `cms:read`, `cms:write`, `pages:read`, `pages:write` — are configured when generating it.

License: MIT. Source: npm `webflow-mcp-server` and Webflow's official AI tools documentation.
