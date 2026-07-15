---
name: Firecrawl
logo: /connectors/firecrawl.svg
category: research
status: available
simpleTitle: "Convertí cualquier sitio web en datos limpios que tu IA pueda leer"
simpleSubtitle: "Server oficial de Firecrawl: scrapear una página, buscar en la web, o recorrer un sitio entero."
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
tagline: "La web, convertida en datos limpios"
originalAuthor: "Firecrawl"
originalAuthorUrl: "https://github.com/firecrawl"
license: "MIT"
licenseUrl: "https://github.com/firecrawl/firecrawl-mcp-server/blob/main/LICENSE"
---
**Firecrawl** convierte páginas web desordenadas en contenido limpio y listo para usar — el tipo de texto con el que una IA realmente puede trabajar. Su conector oficial, según el README, es un *"MCP server for Firecrawl — search, scrape, and interact with the web"*, con tools para scrapear una sola página, buscar en la web, recorrer un sitio entero, mapear todas sus URLs y extraer datos estructurados de muchas páginas a la vez.

Le pasás un link y le pedís *"leé este artículo y resumímelo"*, y trae la página como texto limpio y te responde. Le pedís *"encontrá las páginas de precios de estos cinco competidores"* y busca, abre cada una y saca lo que importa — sin copiar y pegar, sin el formato roto que queda al copiar desde un navegador normal.

### Qué le podés pedir

- *"Leé https://example.com/blog/post y dame los tres puntos principales en lenguaje simple."*
- *"Buscá en la web 'mejor CRM para estudios de abogados chicos 2026' y resumí en qué coinciden los primeros resultados."*
- *"Recorré el sitio de este competidor y listame cada producto que venden con su precio."*

### Qué token necesitás

Necesitás una **API key de Firecrawl** — arranca con `fc-`.

1. Andá a [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys) y creá una cuenta gratis si no tenés.
2. Copiá tu clave (se ve como `fc-…`).
3. Pegala cuando el Lab te pida `FIRECRAWL_API_KEY`. Se guarda cifrada en tu Keychain.

El tier gratis alcanza para probarlo. Recorrer sitios grandes gasta más créditos de Firecrawl, así que mirá tu consumo en el panel de ellos.

--- dev ---

`firecrawl-mcp` (Firecrawl, oficial — repo `firecrawl/firecrawl-mcp-server`) corre con `env FIRECRAWL_API_KEY=fc-… npx -y firecrawl-mcp`. Tools según el README: `scrape` (una página → markdown/HTML limpio), `search` (búsqueda web), `crawl` (recorrido multi-página de un sitio), `map` (enumerar las URLs de un sitio), `extract` (extracción estructurada con LLM sobre varias páginas), más `agent` e `interact`. El README menciona un tier gratis hosted sin clave donde `scrape`, `search` e `interact` funcionan sin key mientras `crawl`, `map`, `agent` y `extract` la requieren — este manifest usa el camino con clave para que todas las tools estén disponibles.

El comportamiento de reintentos/timeout/monitoreo de créditos se configura con env vars adicionales documentadas en el README. `crawl` sobre sitios grandes consume créditos rápido; acotalo a las rutas que necesitás.

Terminal Sync mantiene `FIRECRAWL_API_KEY` en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: github.com/firecrawl/firecrawl-mcp-server.
