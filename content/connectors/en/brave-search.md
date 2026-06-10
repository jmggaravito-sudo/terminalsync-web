---
name: Brave Search
logo: /connectors/brave-search.svg
category: research
status: available
simpleTitle: "Search the web with privacy"
simpleSubtitle: "\"Search recent articles about X\", \"find local results\" — independent index, not Google."
devTitle: "Brave Search MCP"
devSubtitle: "Web + local search via Brave Search API. Token required."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search"
affiliate: false
tagline: "Independent web search"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Brave Search has its own index — useful when you want results that don't depend on Google. The connector also supports local search (businesses, places) when you give it a location.

You need a Brave Search API token (free tier available).

--- dev ---

`@modelcontextprotocol/server-brave-search` requires `BRAVE_API_KEY`. Operations: `brave_web_search`, `brave_local_search`. Rate limits: 1 req/sec on free plan; 20 req/sec on paid.

License: MIT.
