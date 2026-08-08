---
name: Canva
logo: /connectors/canva.svg
category: automation
status: available
simpleTitle: "Generate and edit Canva designs from your agent"
simpleSubtitle: "Official Canva MCP: design generation, editing and export over OAuth."
devTitle: "Canva MCP Connector"
devSubtitle: "Official hosted Canva MCP (mcp.canva.com) — design generation, editing and export through OAuth."
ctaUrl: "https://canva.com"
tokenHelpUrl: "https://www.canva.dev/docs/mcp/"
manifest:
  mcpServers:
    canva:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
affiliate: false
tagline: "Your Canva designs, within reach of the agent"
originalAuthor: "Canva"
originalAuthorUrl: "https://www.canva.dev/docs/mcp/"
license: "proprietary"
licenseUrl: "https://www.canva.com/policies/canva-developer-terms/"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Canva** is the design tool teams use for social posts, presentations, flyers, and brand assets without needing a designer for every small change. The official Canva MCP server lets your agent generate, edit, and export designs directly — no API key pasted into TerminalSync, just your own Canva account login.

Ask *"Show me my most recently edited Canva design"* and the agent brings it up. Ask it to generate a new design or export one for a campaign, and it works against your own Canva account and brand assets. What the agent can do to a design matches your own access level to it — the same permissions you already have in Canva.

### What you can ask

- *"Show me my most recently edited Canva design."*
- *"Generate a new social post design for this week's promo."*
- *"Export this design as a PNG for the newsletter."*
- *"Find the brand assets for our latest campaign folder."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your own Canva account login:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens Canva's login in your browser and asks you to authorize access.
3. Approve it with your account. Canva requires each user to authenticate individually — official setup docs are at [canva.dev](https://www.canva.dev/docs/mcp/).

**Honest note:** this is a server **hosted by Canva** (`https://mcp.canva.com/mcp`), not something that runs on your computer. Some capabilities (like resizing designs or using brand kits/autofill templates) depend on your Canva plan — Pro or Enterprise unlock more than the free plan.

--- dev ---

Canva publishes an official **remote MCP server** at `https://mcp.canva.com/mcp`, documented at `canva.dev/docs/mcp/`. Auth uses **Client ID Metadata Documents (CIMD)** — Canva's docs call CIMD *"the recommended authentication method for MCP"* — with Dynamic Client Registration (DCR) kept available for backward compatibility but marked deprecated. Each user authenticates individually; there's no shared secret to inject, so TerminalSync bridges the hosted endpoint with:

```
npx -y mcp-remote@latest https://mcp.canva.com/mcp
```

Documented tool categories: design generation, design editing, design discovery, asset and brand management, design export (PDF, PNG, JPG, PPTX, MP4, and more), and collaborative workflows (commenting). Canva's docs note operations are scoped to *"the operations available to a user match their level of access to a design or asset"*, and that some features (design resizing on Canva Pro+; autofill templates and brand kits on Enterprise) are plan-gated.

License: proprietary SaaS terms, governed by Canva's API and App Developer Terms (`canva.com/policies/canva-developer-terms/`). Source: canva.dev/docs/mcp/.
