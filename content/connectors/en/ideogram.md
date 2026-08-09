---
name: Ideogram
logo: /connectors/ideogram.svg
category: automation
status: available
simpleTitle: "Create brand-grade images from your agent"
simpleSubtitle: "Official Ideogram MCP: image generation, editing, and visual iteration over OAuth."
devTitle: "Ideogram MCP Connector"
devSubtitle: "Official hosted Ideogram MCP (mcp.ideogram.ai) — generate, edit and train visuals through OAuth."
ctaUrl: "https://ideogram.ai/features/mcp/"
tokenHelpUrl: "https://ideogram.ai/features/mcp/"
manifest:
  mcpServers:
    ideogram:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.ideogram.ai/mcp"]
affiliate: false
tagline: "Your visual studio, within reach of the agent"
originalAuthor: "Ideogram"
originalAuthorUrl: "https://ideogram.ai/features/mcp/"
license: "proprietary"
licenseUrl: "https://ideogram.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Ideogram** is the image-generation studio teams use when text, typography, product mockups, posters, logos, and campaign visuals need to look polished instead of random. The official Ideogram MCP server lets your agent generate and revise visuals from inside the workflow — no API key pasted into TerminalSync, just your Ideogram account login.

Ask *"Create three Instagram ad concepts for this weekend promo with clean Spanish headline text"* and the agent can call Ideogram to generate options. Ask *"Remix this into a square version and keep the same brand style"* and it can iterate without leaving the chat. Usage comes from your Ideogram plan/credits.

### What you can ask

- *"Generate four poster options for our launch, with readable headline text."*
- *"Create a product mockup for this new skincare bundle in a premium style."*
- *"Remix this image into a vertical story format while keeping the same look."*
- *"Build a small visual set for a campaign: logo direction, hero image, and social posts."*

### How you connect

This connector **doesn't ask you to paste an API key**. It uses your Ideogram account:

1. Enable the connector in TerminalSync.
2. The `mcp-remote` bridge opens the Ideogram OAuth flow in your browser.
3. Sign in and authorize access. Ideogram says MCP usage uses the same subscription/credits as the web app.

**Honest note:** this is a **hosted server by Ideogram** (`https://mcp.ideogram.ai/mcp`). The visual generation happens in Ideogram's service, and your account/plan controls what can be generated.

--- dev ---

Ideogram publishes an official **remote MCP server** at `https://mcp.ideogram.ai/mcp` using streamable HTTP. The official setup docs show the same endpoint for Claude, Claude Code, ChatGPT, Cursor, Cline, OpenCode, and custom MCP clients. Auth is OAuth through the user's Ideogram account; no API key is required for the MCP connector.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.ideogram.ai/mcp
```

Official docs describe capabilities across image generation, editing/remix, style work, background workflows, typography, and custom models. For server-to-server product pipelines, Ideogram recommends the REST API at `developer.ideogram.ai`; this connector is the agent/user OAuth path.

License: proprietary SaaS terms. Source: ideogram.ai/features/mcp and developer.ideogram.ai.
