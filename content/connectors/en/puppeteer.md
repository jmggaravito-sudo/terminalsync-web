---
name: Puppeteer
logo: /connectors/puppeteer.svg
category: dev
status: available
simpleTitle: "Your AI navigates the browser like a person"
simpleSubtitle: "Logged-in screenshots, click buttons, fill forms — when fetch isn't enough."
devTitle: "Puppeteer MCP"
devSubtitle: "Real browser automation via Puppeteer. Headless or headed."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer"
affiliate: false
tagline: "Real browser automation"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
The Fetch connector reads HTML — Puppeteer renders pages with JavaScript, clicks, types, and screenshots. Use it when the page lives behind login or needs interaction.

Heavier than Fetch (spawns a browser). Reserve it for cases where you really need a browser.

--- dev ---

`@modelcontextprotocol/server-puppeteer` runs Chrome via Puppeteer. Operations: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_evaluate`, `puppeteer_select`, `puppeteer_hover`. Supports headed mode for debugging.

License: MIT.
