---
name: TopView MCP
logo: /connectors/topview.svg
category: automation
status: available
simpleTitle: "Turn campaign briefs into research, strategy, and creative output"
simpleSubtitle: "Official TopView MCP: campaign workspace flows for market research, planning, images, videos, UGC-style concepts, and storyboards."
devTitle: "TopView MCP Connector"
devSubtitle: "Official TopView MCP remote server — campaign workspace workflows from topview.ai and mcp.topview.ai."
ctaUrl: "https://www.topview.ai/mcp"
affiliate: false
tagline: "Turn campaign briefs into market research, strategy, and creative assets."
originalAuthor: "TopView"
originalAuthorUrl: "https://www.topview.ai/mcp"
license: "proprietary"
licenseUrl: "https://www.topview.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**TopView MCP** connects your AI client to TopView's campaign workspace. It helps turn a campaign brief into market research, strategy, content planning, and creative production workflows for ads, images, videos, UGC-style concepts, and storyboards.

TopView positions this as a full-stack AI marketing agent: one brief can move from market signals and competitor research into campaign plans, content briefs, creative direction, and generated assets inside the same Campaign Workspace.

### What you can ask

- *"Research a market or competitor angle for this campaign."*
- *"Turn this brief into a campaign plan and content strategy."*
- *"Prepare creative directions, scripts, storyboards, or UGC-style ad concepts."*
- *"Generate campaign assets, then keep them in the same workspace for review."*

### How you connect

TopView MCP is configured from **TopView's own remote MCP setup**, not as a bundled local sidecar inside TerminalSync:

1. Add TopView's MCP server URL in your MCP-compatible client: `https://mcp.topview.ai/mcp`.
2. Sign in with your TopView account when the login flow opens.
3. Work from TopView's Campaign Workspace to manage the generated plans, boards, images, videos, and creative workflow.

**Honest note:** TerminalSync does **not** bundle a local TopView sidecar or invent a separate OAuth flow here. TopView's official setup says to connect the remote MCP URL, sign in with your TopView account, and continue the workflow in Campaign Workspace.

--- dev ---

Official source: `https://www.topview.ai/mcp`.

TopView documents MCP as a **remote MCP server** reached at `https://mcp.topview.ai/mcp`. Their Quick Start says to connect the MCP URL, open the returned login link, sign in with a TopView account, and then use the tools from the TopView Campaign Workspace. The same page positions TopView MCP as a workflow that combines market insights, strategy outputs, and creative production in one workspace.

For TerminalSync's catalog contract, this listing is treated as **remote / user-managed**, similar to other account-configured MCP offerings. We do **not** ship a static `mcpServers` manifest or a local sidecar binary here because the official setup is driven from TopView's remote MCP endpoint and account login flow.

License: proprietary SaaS terms. Source: topview.ai/mcp.
