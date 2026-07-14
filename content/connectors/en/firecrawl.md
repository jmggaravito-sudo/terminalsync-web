---
name: Firecrawl
logo: /connectors/firecrawl.svg
category: research
status: available
simpleTitle: "Turn any website into clean data your AI can read"
simpleSubtitle: "Official Firecrawl server: scrape a page, search the web, or crawl a whole site."
devTitle: "Firecrawl MCP Connector"
devSubtitle: "Official firecrawl-mcp (firecrawl/firecrawl-mcp-server): scrape, search, crawl, map, extract."
ctaUrl: "https://www.firecrawl.dev"
tokenHelpUrl: "https://www.firecrawl.dev/app/api-keys"
manifest:
  mcpServers:
    firecrawl:
      command: npx
      args: ["-y", "firecrawl-mcp"]
      env:
        FIRECRAWL_API_KEY: "${SECRET:FIRECRAWL_API_KEY}"
affiliate: false
tagline: "The web, turned into clean data"
originalAuthor: "Firecrawl"
originalAuthorUrl: "https://github.com/firecrawl"
license: "MIT"
licenseUrl: "https://github.com/firecrawl/firecrawl-mcp-server/blob/main/LICENSE"
---
**Firecrawl** turns messy web pages into clean, ready-to-use content — the kind of text an AI can actually work with. Its official connector, per the README, is an *"MCP server for Firecrawl — search, scrape, and interact with the web"*, with tools to scrape a single page, search the web, crawl an entire site, map all its URLs, and extract structured data from many pages at once.

Ask *"read this article and summarize it for me"* with a link, and it fetches the page as clean text and answers. Ask *"find the pricing pages of these five competitors"* and it searches, opens each, and pulls out what matters — no copy-pasting, no broken formatting from a normal browser copy.

### What you can ask

- *"Read https://example.com/blog/post and give me the three main points in plain language."*
- *"Search the web for 'best CRM for small law firms 2026' and summarize what the top results agree on."*
- *"Go through this competitor's site and list every product they sell with its price."*

### What token you need

You need a **Firecrawl API key** — it starts with `fc-`.

1. Go to [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys) and create a free account if you don't have one.
2. Copy your key (it looks like `fc-…`).
3. Paste it when the Lab asks for `FIRECRAWL_API_KEY`. It's stored encrypted in your Keychain.

The free tier is enough to try it. Heavy crawling of large sites uses more of your Firecrawl credits, so keep an eye on your usage in their dashboard.

--- dev ---

`firecrawl-mcp` (Firecrawl, official — repo `firecrawl/firecrawl-mcp-server`) runs via `env FIRECRAWL_API_KEY=fc-… npx -y firecrawl-mcp`. Tools per the README: `scrape` (single page → clean markdown/HTML), `search` (web search), `crawl` (multi-page crawl of a site), `map` (enumerate a site's URLs), `extract` (LLM-powered structured extraction across pages), plus `agent` and `interact`. The README notes a hosted keyless free tier where `scrape`, `search` and `interact` work without a key while `crawl`, `map`, `agent` and `extract` require one — this manifest uses the self-hosted-with-key path so every tool is available.

Retry/timeout/credit-monitoring behavior is configurable via additional env vars documented in the README. `crawl` on large sites consumes credits fast; scope it to the paths you need.

Terminal Sync keeps `FIRECRAWL_API_KEY` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: github.com/firecrawl/firecrawl-mcp-server.
