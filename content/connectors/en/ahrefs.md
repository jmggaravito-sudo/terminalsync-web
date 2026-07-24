---
name: Ahrefs
logo: /connectors/ahrefs.svg
category: automation
status: available
simpleTitle: "Your SEO, explained in plain words"
simpleSubtitle: "\"Where do we rank?\" \"Who links to us?\" \"What should we write about?\" — your AI reads your SEO data."
devTitle: "Ahrefs MCP Connector"
devSubtitle: "Official Ahrefs MCP over the Ahrefs API — rankings, backlinks, referring domains, organic keywords, domain metrics."
ctaUrl: "https://ahrefs.com"
tokenHelpUrl: "https://docs.ahrefs.com/docs/api/reference/api-keys-creation-and-management"
manifest:
  mcpServers:
    ahrefs:
      command: npx
      args: ["-y", "@ahrefs/mcp"]
      env:
        API_KEY: "${SECRET:AHREFS_API_KEY}"
affiliate: false
tagline: "Rankings, backlinks and keywords at AI reach"
originalAuthor: "Ahrefs"
originalAuthorUrl: "https://ahrefs.com"
license: "MIT"
---
Getting found on Google is half the battle for a small business, but SEO tools are built for specialists and drown you in charts. If you have an **Ahrefs** account, this connector lets your AI read your SEO data and answer the questions that actually matter — in plain words, without you learning the dashboard.

Ask *"where do we rank for our main keywords?"* and it reads your positions. Ask *"who's linking to us, and did we lose any links this month?"* and it checks your backlinks. Ask *"what are people searching that we could write about?"* and it pulls keyword ideas. It turns a specialist tool into something you can just ask.

### What you can ask

- *"What keywords are we on page 2 for? Those are the quick wins."*
- *"List the sites linking to us, best first, and flag any links we lost."*
- *"Compare our domain strength against my two main competitors."*

### What you need

Ahrefs connects with an **API key** from your Ahrefs account:

1. Follow the official guide at [docs.ahrefs.com → API keys](https://docs.ahrefs.com/docs/api/reference/api-keys-creation-and-management) to create and manage a key.
2. Make sure the key's permissions cover the data you want to ask about.
3. Copy the key and paste it when the Lab asks for `AHREFS_API_KEY`.

The key is stored encrypted in your Keychain and synced across your machines.

> Heads up: the Ahrefs API is a **paid** add-on to an Ahrefs subscription — this connector reads the data your plan already gives you, but you need API access enabled on your account. If you don't have Ahrefs, the "is my site up / how fast is it" style checks are covered by other connectors; Ahrefs is specifically for search rankings and backlinks.

--- dev ---

`@ahrefs/mcp` (published by **Ahrefs**, official) exposes the Ahrefs API to the agent. The package README is install-focused and does not enumerate individual tool names; the underlying Ahrefs API surface covers **organic keywords / rankings**, **backlinks and referring domains**, **domain rating / URL rating**, **keyword metrics and ideas**, and **rank tracking** — the connector maps those to MCP tools.

Auth is a single `API_KEY` env var (an Ahrefs API key; permissions are set on the key itself). Requires API access on the Ahrefs subscription.

Terminal Sync keeps the key in your Keychain, synced encrypted across machines with AES-256-GCM. This is a read-only connector — it reports data, it doesn't change anything on Ahrefs.

License: MIT. Source: npm `@ahrefs/mcp` (author Ahrefs).
