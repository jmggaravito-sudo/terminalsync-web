---
name: Fetch
logo: /connectors/fetch.svg
category: dev
status: available
simpleTitle: "Tu IA navega la web"
simpleSubtitle: "Le pedís que lea un artículo, resuma una página de docs o baje un PDF — lo hace."
devTitle: "HTTP Fetch MCP"
devSubtitle: "Fetcher HTTP genérico con conversión HTML→markdown. Allow-list de URLs configurable."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch"
affiliate: false
tagline: "Navegá y resumí cualquier URL pública"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Pegás un link. Tu IA lo abre, lo lee y te cuenta qué hay. Artículo, página de docs, blog, hasta un PDF público — sin copy-paste.

Por default solo fetchea URLs públicas; páginas privadas o con auth necesitan su propio conector.

--- dev ---

`@modelcontextprotocol/server-fetch` expone `fetch(url, max_length?)` que devuelve el contenido convertido a markdown. Es HTTP puro — sin JS rendering, sin auth, sin login walls. Configurable con `--ignore-robots-txt` y `--user-agent`. Para páginas con browser real usá el conector Puppeteer.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/fetch.
