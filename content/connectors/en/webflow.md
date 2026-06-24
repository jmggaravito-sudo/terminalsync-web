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
Your Webflow site may have pages, collections and CMS content that change all the time. With this connector, the agent can work against the Webflow API using a token you store as a secret.

For visual editing and the Designer bridge, follow Webflow's official guide for AI tools and the MCP Bridge App.

--- dev ---

`webflow-mcp-server` is the package published by Webflow to run the MCP server locally with `npx`. In local install it uses `WEBFLOW_TOKEN` to authenticate against the Webflow Data API; Webflow's docs also describe a remote OAuth mode via `mcp-remote`.

License: MIT. Source: npm `webflow-mcp-server` and Webflow's official AI tools documentation.
