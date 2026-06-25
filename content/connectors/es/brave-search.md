---
name: Brave Search
logo: /connectors/brave-search.svg
category: research
status: available
simpleTitle: "Que tu IA busque en la web con Brave"
simpleSubtitle: "Resultados web y búsquedas locales desde un índice independiente, no Google."
devTitle: "Brave Search MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: web search + local search vía Brave Search API."
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
tagline: "Búsqueda web independiente"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
**Brave Search** es el buscador de Brave. Usa un índice propio, útil cuando querés que tu IA busque en la web sin depender de Google.

Este conector conecta tu IA con la API de Brave Search. El README oficial dice que integra la API de Brave y ofrece *"both web and local search capabilities"*: búsqueda general de páginas, noticias y artículos, además de búsquedas locales para negocios, restaurantes y servicios.

### Qué le podés pedir

- *"Buscá noticias recientes sobre esta empresa y resumime los puntos que se repiten en varias fuentes."*
- *"Encontrá servicios de reparación de bicicletas cerca de esta zona y compará opciones."*
- *"Buscá artículos de los últimos meses sobre este tema y separá fuentes oficiales de opiniones."*

### Qué token necesitás

Necesitás una **API key de Brave Search API**. El README oficial indica que hay un plan gratuito disponible y enlaza el dashboard de claves.

1. Creá una cuenta de Brave Search API en `https://brave.com/search/api/`.
2. Elegí un plan; el README menciona un free tier de 2.000 consultas por mes.
3. Generá tu clave en `https://api.search.brave.com/app/keys`.
4. Pegá la clave cuando el Lab te pida `BRAVE_API_KEY`. Terminal Sync la guarda cifrada en tu Keychain.

Tené presente los límites de uso del plan elegido. Para equipos, conviene usar una key separada para Terminal Sync y revisarla periódicamente.

--- dev ---

`@modelcontextprotocol/server-brave-search` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-brave-search` con `BRAVE_API_KEY` en `env`.

Tools verificadas contra README y bundle npm: `brave_web_search` y `brave_local_search`. `brave_web_search` acepta `query`, `count` opcional con máximo 20 y `offset` opcional con máximo 9. `brave_local_search` acepta `query` y `count` opcional con máximo 20; el README documenta que cae automáticamente a búsqueda web si no encuentra resultados locales.

Features documentadas por el README oficial: web search para general queries, news y articles con pagination/freshness controls; local search para businesses, restaurants y services; flexible filtering; smart fallbacks.

Terminal Sync guarda `BRAVE_API_KEY` en el Keychain via `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-brave-search` en npm.
