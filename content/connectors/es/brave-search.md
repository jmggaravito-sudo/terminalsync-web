---
name: Brave Search
logo: /connectors/brave-search.svg
category: research
status: available
simpleTitle: "Buscá en la web con privacidad"
simpleSubtitle: "\"Buscame artículos recientes sobre X\", \"encontrame resultados locales\" — índice independiente, no Google."
devTitle: "Brave Search MCP"
devSubtitle: "Búsqueda web + local vía API de Brave Search. Requiere token."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search"
affiliate: false
tagline: "Búsqueda web independiente"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Brave Search tiene su propio índice — útil cuando querés resultados que no dependan de Google. El conector también soporta búsqueda local (negocios, lugares) cuando le das una ubicación.

Necesitás un token de API de Brave Search (tier free disponible).

--- dev ---

`@modelcontextprotocol/server-brave-search` requiere `BRAVE_API_KEY`. Operaciones: `brave_web_search`, `brave_local_search`. Rate limits: 1 req/seg en plan free; 20 req/seg en pago.

Licencia: MIT.
