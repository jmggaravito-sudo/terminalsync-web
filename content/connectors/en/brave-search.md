---
name: Brave Search
logo: /connectors/brave-search.svg
category: research
status: available
simpleTitle: "Let your AI search the web with Brave"
simpleSubtitle: "Web results and local searches from an independent index, not Google."
devTitle: "Brave Search MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: web search + local search through the Brave Search API."
ctaUrl: "https://brave.com/search/api/"
tokenHelpUrl: "https://api.search.brave.com/app/keys"
manifest:
  mcpServers:
    brave-search:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-brave-search"]
      env:
        BRAVE_API_KEY: "${SECRET:BRAVE_API_KEY}"
affiliate: false
tagline: "Independent web search"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**Brave Search** is Brave's search engine. It uses its own index, useful when you want your AI to search the web without depending on Google.

This connector connects your AI to the Brave Search API. The official README says it integrates the Brave API and provides *"both web and local search capabilities"*: general search for pages, news and articles, plus local searches for businesses, restaurants and services.

### What you can ask

- *"Search for recent news about this company and summarize the points that repeat across sources."*
- *"Find bicycle repair services near this area and compare the options."*
- *"Search for articles from the last few months about this topic and separate official sources from opinions."*

### What token you need

You need a **Brave Search API key**. The official README says a free tier is available and links to the key dashboard.

1. Create a Brave Search API account at `https://brave.com/search/api/`.
2. Choose a plan; the README mentions a free tier with 2,000 queries per month.
3. Generate your key at `https://api.search.brave.com/app/keys`.
4. Paste the key when the Lab asks for `BRAVE_API_KEY`. Terminal Sync stores it encrypted in your Keychain.

Keep the usage limits for your plan in mind. For teams, use a separate key for Terminal Sync and review it periodically.

--- dev ---

`@modelcontextprotocol/server-brave-search` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-brave-search` with `BRAVE_API_KEY` in `env`.

Tools verified against the README and npm bundle: `brave_web_search` and `brave_local_search`. `brave_web_search` accepts `query`, optional `count` with max 20 and optional `offset` with max 9. `brave_local_search` accepts `query` and optional `count` with max 20; the README documents that it automatically falls back to web search if no local results are found.

Features documented by the official README: web search for general queries, news and articles with pagination/freshness controls; local search for businesses, restaurants and services; flexible filtering; smart fallbacks.

Terminal Sync keeps `BRAVE_API_KEY` in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-brave-search` on npm.
