---
name: Canva
logo: /connectors/canva.svg
category: automation
status: available
simpleTitle: "Create and edit Canva designs from your agent"
simpleSubtitle: "Official Canva connector: generate designs, resize them, search your workspace, and export."
devTitle: "Canva MCP Connector"
devSubtitle: "Official hosted Canva MCP (mcp.canva.com) — design generation and management over OAuth."
ctaUrl: "https://www.canva.com"
tokenHelpUrl: "https://www.canva.com/help/mcp-agent-setup/"
manifest:
  mcpServers:
    canva:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
affiliate: false
tagline: "Your design workspace, within reach of the agent"
originalAuthor: "Canva"
originalAuthorUrl: "https://www.canva.dev/docs/mcp/"
license: "proprietary"
licenseUrl: "https://www.canva.com/policies/terms-of-use/"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Canva** is the design tool teams use to make social posts, presentations, flyers, and other marketing documents without a design background. The official **Canva AI Connector** is a **hosted MCP server** that lets your agent generate designs with Canva AI, find existing designs in your workspace, resize them for a different channel, and export them — all through your own Canva account.

Ask *"Generate a set of Instagram posts for our summer sale using our brand kit"* and it creates the designs with Canva AI. Say *"Resize this flyer into an Instagram Story format"* and it reformats an existing design instead of you rebuilding it by hand. It returns editable designs into your Canva Projects, so you can open and polish whatever it made.

### What you can ask

- *"Generate a full presentation for this week's sales update."*
- *"Resize this flyer into an Instagram Story format."*
- *"Find my most recently edited Canva design."*
- *"Export this presentation as a PDF."*

### How you connect

This connector **doesn't ask you to paste any API key**. It uses your own Canva account login:

1. When you enable it, a browser window opens for you to sign in to Canva and authorize access (OAuth).
2. You approve the permissions with your account — the connector can only see and do what that account is allowed to.
3. That's it: no token to copy or renew by hand. Canva's official setup guide is at [canva.com/help](https://www.canva.com/help/mcp-agent-setup/).

**Honest note:** it's a server **hosted by Canva** (it doesn't run on your computer). Some capabilities depend on your Canva plan: design generation, editing, search, exports, comments, and asset uploads work on every plan; **resizing designs to new dimensions requires Canva Pro or above**; **autofilling templates with your brand kit and brand templates requires Canva Enterprise**. What the agent can see or create is bounded by what your account can already access.

--- dev ---

Canva publishes an official **remote/hosted MCP server** at `https://mcp.canva.com/mcp`, documented at `www.canva.dev/docs/mcp/` (aimed at IT admins and integration builders) and at `www.canva.com/help/mcp-agent-setup/` (the end-user setup guide for Claude, ChatGPT, Cursor, etc.). There's no local stdio command: you connect to the hosted URL and bridge it locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.canva.com/mcp
```

**Sourcing note:** Canva also documents a separate, developer-only MCP at `www.canva.dev/docs/apps/mcp-server/` that provides "AI-powered development assistance for Canva apps and integrations" — a docs/SDK assistant for people *building* Canva Apps, not for managing designs. That page explicitly points end users elsewhere: *"Looking for the Canva AI Connector to help with your Canva designs? See our Help Center."* This connector ships that AI Connector (`mcp.canva.com`), not the dev-docs assistant — the dev-docs one would fail this catalog's business-first persona filter the same way Wix's dev-only MCP did.

Auth uses **Client ID Metadata Documents (CIMD)** as Canva's preferred method, with **Dynamic Client Registration (DCR)** supported for backward compatibility; per the docs, "individual user authentication is mandatory." `mcp-remote` handles this OAuth-style flow in the browser, so the manifest declares no `env`/secret.

**Capabilities, verbatim from the docs:** programmatic design generation from text descriptions, targeted design modifications via natural language, library search and design discovery, asset and brand management, multi-format exports (PDF, PNG, JPG, PPTX, MP4), and design commenting/collaborative workflows.

**Plan gating, per the docs:** all plans get design generation, editing, search, exports, comments, and asset uploads; Canva Pro and above adds design resizing to new dimensions; Canva Enterprise adds autofilling templates with brand kits and brand templates. Rate limits are documented per-operation in Canva's tools reference rather than on the overview page.

Canva doesn't publish an open-source repo or LICENSE for the hosted server — treated as proprietary SaaS terms, same pattern as Zapier/Ideogram/Asana/Klaviyo in this catalog. Source: canva.dev/docs/mcp, canva.com/help/mcp-agent-setup.
