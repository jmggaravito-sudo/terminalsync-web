---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Let your AI work with your Webflow site"
simpleSubtitle: "Edit the canvas, manage the CMS, audit SEO — from chat."
devTitle: "Webflow MCP Server"
devSubtitle: "Official Webflow MCP server over the Designer API and Data API."
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
**Webflow** is one of the most widely used visual website builders — hand-designed pages, CMS collections, e-commerce, all managed without code. If your site (or a client's) runs on Webflow, this connector lets your AI work against the site directly, without you opening the panel.

The official docs split the two APIs the connector exposes:

- **Designer API tools** — real-time canvas work: *"Create and modify elements, styles, and components"*, *"Manage responsive breakpoints and positioning"*, *"variables, classes, and component instances"*.
- **Data API tools** — content operations: *"Create, read, update, and delete collection items"*, *"Upload, organize, and manage media files"*, *"Access site settings, domains, and configuration"*.

Scope ranges from *"update the home page title"* to juicier things like auditing SEO across every page at once, or building entire design system components.

### What you can ask

The three representative prompts the official documentation suggests:

- *"List all my collections and show me their field structures."*
- *"Audit my site for broken links, missing alt text, and incomplete meta descriptions."*
- *"Create a responsive hero section with a headline, description, and CTA button."*

### What token you need

The official documentation emphasizes **OAuth** as the recommended method: the agent authenticates against your Webflow account without you copy-pasting API keys.

For the local mode with `webflow-mcp-server` (what this connector installs), you use an **API token** generated at [webflow.com/dashboard/account/integrations](https://webflow.com/dashboard/account/integrations):

1. Go to the "API Access" / "Integrations" section of your Workspace or account.
2. Create a new token, choosing between Site Token (scope: one site) or Workspace Token (scope: entire workspace).
3. Check the scopes you need: `sites:read`, `cms:read`, `cms:write`, `pages:read`, `pages:write`.
4. Copy the token and paste it when the Lab asks for `WEBFLOW_TOKEN`. Encrypted in your Keychain, never plaintext on disk.

For visual editing with the Designer bridge (not just CMS) follow the [official AI tools guide](https://developers.webflow.com/data/v2.0.0/docs/ai-tools) — it includes installing Webflow's MCP Bridge App.

--- dev ---

`webflow-mcp-server` (official, Webflow) runs via `npx` and authenticates via `WEBFLOW_TOKEN` against the Data API. The official docs split two surfaces: Designer API (canvas) and Data API (CMS + site config); the local server primarily covers the latter.

Remote OAuth mode also supported via `mcp-remote`, avoiding per-user token management. Site Token = per-site scope; Workspace Token = workspace-wide scope. Individual scopes are picked at token generation time.

License: MIT. Source: npm `webflow-mcp-server` and `developers.webflow.com/data/v2.0.0/docs/ai-tools`.
