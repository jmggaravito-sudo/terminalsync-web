---
name: Fetch
logo: /connectors/fetch.svg
category: dev
status: available
simpleTitle: "Your AI can browse the open web"
simpleSubtitle: "Ask it to read an article, summarize a docs page, or pull a PDF — it goes and gets it."
devTitle: "HTTP Fetch MCP"
devSubtitle: "Generic HTTP fetcher with HTML→markdown conversion. URL allow-list configurable."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch"
affiliate: false
tagline: "Browse and summarize any public URL"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
You paste a link. Your AI opens it, reads it, and tells you what's there. Article, docs page, blog post, even a public PDF — no copy-paste needed.

It only fetches public URLs by default; private or auth-protected pages need their own connector.

--- dev ---

`@modelcontextprotocol/server-fetch` exposes `fetch(url, max_length?)` returning the page content converted to markdown. HTTP-only — no JS rendering, no auth, no login walls. Configurable via `--ignore-robots-txt` and `--user-agent` flags. Use Puppeteer connector when you need a real browser.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/fetch.
