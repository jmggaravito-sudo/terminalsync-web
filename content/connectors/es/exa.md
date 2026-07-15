---
name: Exa
logo: /connectors/exa.svg
category: research
status: available
simpleTitle: "Dale a tu IA búsqueda web en tiempo real, hecha para IA"
simpleSubtitle: "Server oficial de Exa: resultados limpios y listos para usar — más research de empresas y personas."
devTitle: "Exa MCP Connector"
devSubtitle: "Official exa-mcp-server (exa-labs): web_search_exa + research/crawl tools, EXA_API_KEY."
ctaUrl: "https://exa.ai"
tokenHelpUrl: "https://dashboard.exa.ai/api-keys"
manifest:
  mcpServers:
    exa:
      command: npx
      args: ["-y", "exa-mcp-server"]
      env:
        EXA_API_KEY: "${SECRET:EXA_API_KEY}"
affiliate: false
tagline: "Búsqueda web hecha para el agente"
originalAuthor: "Exa Labs"
originalAuthorUrl: "https://github.com/exa-labs"
license: "MIT"
licenseUrl: "https://github.com/exa-labs/exa-mcp-server/blob/main/LICENSE"
---
**Exa** es un buscador hecho para IA, no para humanos que clickean links azules. Su conector oficial, según el README, es *"a Model Context Protocol server with Exa for web search and web crawling"* que da resultados en tiempo real como **contenido limpio y listo para usar** — así el agente recibe el texto real de una página, no una lista de links para abrir. Más allá de la búsqueda simple, puede investigar una empresa, encontrar personas y correr tareas de research de varios pasos.

Le preguntás *"¿qué está diciendo la gente de este producto este mes?"* y busca en la web en vivo y resume. Le pedís *"investigá esta empresa — qué hace, quién la dirige, noticias recientes"* y usa su tool de research de empresas para armar un perfil real. Es la diferencia entre una IA que adivina desde datos viejos de entrenamiento y una que de verdad lo buscó hoy.

### Qué le podés pedir

- *"Buscá en la web qué cambió en las reglas de privacidad de datos de la UE en 2026 y resumí el impacto práctico para un negocio chico."*
- *"Investigá la empresa de stripe.com — qué hacen, tamaño, y cualquier anuncio reciente."*
- *"Encontrá tres artículos recientes y creíbles que comparen paneles solares vs. bombas de calor para calefacción del hogar y dame las conclusiones."*

### Qué token necesitás

Necesitás una **API key de Exa**.

1. Andá a [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys) y creá una cuenta gratis.
2. Copiá tu API key.
3. Pegala cuando el Lab te pida `EXA_API_KEY`. Se guarda cifrada en tu Keychain.

El tier gratis de Exa alcanza para probarlo; la búsqueda intensiva y las tools de deep-research consumen más de tu cuenta, así que mirá tu uso en el panel de ellos.

--- dev ---

`exa-mcp-server` (Exa Labs, oficial — repo `exa-labs/exa-mcp-server`) corre con `npx -y exa-mcp-server` y `EXA_API_KEY` en el env. Tools según la tabla del README: `web_search_exa` y `web_search_advanced_exa` (búsqueda con filtros/dominios/fechas), `get_code_context_exa`, `company_research_exa`, `crawling_exa` (traer el contenido de una URL), `people_search_exa`, `linkedin_search_exa`, `deep_researcher_start` / `deep_researcher_check` (research asíncrono de varios pasos vía la Research API de Exa), y `deep_search_exa`. El conjunto de tools habilitadas se selecciona con el parámetro `tools` (y en el endpoint hosted vía `?tools=`).

Terminal Sync mantiene `EXA_API_KEY` en Keychain vía `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: github.com/exa-labs/exa-mcp-server.
