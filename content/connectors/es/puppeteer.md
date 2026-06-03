---
name: Puppeteer
logo: /connectors/puppeteer.svg
category: dev
status: available
simpleTitle: "Tu IA navega el browser como una persona"
simpleSubtitle: "Screenshots de páginas con login, clicks en botones, fill de forms — cuando fetch no alcanza."
devTitle: "Puppeteer MCP"
devSubtitle: "Automatización de browser real vía Puppeteer. Headless o con UI."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer"
affiliate: false
tagline: "Automatización browser real"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
El conector Fetch lee HTML — Puppeteer renderiza páginas con JavaScript, hace clicks, escribe en inputs, toma screenshots. Usalo cuando la página vive detrás de login o requiere interacción.

Pesa más que Fetch (spawnea browser). Reservalo para casos donde realmente necesitás un browser.

--- dev ---

`@modelcontextprotocol/server-puppeteer` corre Chrome via Puppeteer. Operaciones: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_evaluate`, `puppeteer_select`, `puppeteer_hover`. Soporta modo headed para debugging.

Licencia: MIT.
