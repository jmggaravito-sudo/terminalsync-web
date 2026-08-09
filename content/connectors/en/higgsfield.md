---
name: Higgsfield
logo: /connectors/higgsfield.svg
category: automation
status: available
simpleTitle: "Generate images and videos from your agent"
simpleSubtitle: "Official Higgsfield MCP: 30+ creative models for images, video, characters and history."
devTitle: "Higgsfield MCP Connector"
devSubtitle: "Official hosted Higgsfield MCP (mcp.higgsfield.ai) — creative generation over account OAuth."
ctaUrl: "https://higgsfield.ai/mcp"
tokenHelpUrl: "https://higgsfield.ai/mcp"
manifest:
  mcpServers:
    higgsfield:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.higgsfield.ai/mcp"]
affiliate: false
tagline: "Images and videos, within reach of the agent"
originalAuthor: "Higgsfield"
originalAuthorUrl: "https://higgsfield.ai/mcp"
license: "proprietary"
licenseUrl: "https://higgsfield.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Higgsfield** is a creative AI platform for image and video generation. Its official MCP connector gives your agent access to Higgsfield's creative models from inside your workflow: generate images, create short videos, train or reuse characters, and browse your generation history.

Ask *"Make a 15-second vertical UGC video concept for this tumbler"* and the agent can plan the creative, call Higgsfield, and return the result. Ask *"Create three product shots from this reference image"* and it can iterate on visual directions. Higgsfield says usage draws from the same credit system as your Higgsfield account.

### What you can ask

- *"Generate a 9:16 UGC video for this product with captions and a clear CTA."*
- *"Create a cinematic product shot for this new offer."*
- *"Turn this still into a short motion concept for Instagram Reels."*
- *"Reuse a previous generation as reference and make a Spanish localized version."*

### How you connect

This connector **doesn't require an API key**:

1. Enable Higgsfield in TerminalSync.
2. The connector opens the Higgsfield sign-in flow in your browser.
3. Approve with your Higgsfield account. Your plan/credits control generation.

**Honest note:** this is a **hosted Higgsfield MCP server** (`https://mcp.higgsfield.ai/mcp`). Generation runs in Higgsfield's service, including asynchronous video jobs that may take longer than images.

--- dev ---

Higgsfield publishes an official MCP endpoint at `https://mcp.higgsfield.ai/mcp`. The official page says any MCP-compatible client can connect, no API key is needed, and auth happens through the user's Higgsfield account. It also documents the CLI path (`npm i -g @higgsfield/cli`, `higgsfield auth login`, optional `npx skills add higgsfield-ai/skills`) for terminal-first workflows.

TerminalSync bridges the hosted endpoint locally with:

```
npx -y mcp-remote@latest https://mcp.higgsfield.ai/mcp
```

Capabilities documented by Higgsfield include image generation, videos up to 15 seconds, 30+ models, character/Soul training, generation history browsing, reference-image workflows, and asynchronous polling for results.

License: proprietary SaaS terms. Source: higgsfield.ai/mcp and higgsfield.ai/cli.
