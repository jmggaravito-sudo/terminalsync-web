---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Que tu IA trabaje con tu sitio Webflow"
simpleSubtitle: "Consultá sitios, colecciones y CMS items usando un token guardado como secreto."
devTitle: "Webflow MCP Server"
devSubtitle: "Official Webflow MCP server over the Webflow Data API and Designer bridge."
ctaUrl: "https://developers.webflow.com/data/v2.0.0/docs/ai-tools"
manifest:
  mcpServers:
    webflow:
      command: npx
      args: ["-y", "webflow-mcp-server"]
      env:
        WEBFLOW_TOKEN: "${SECRET:WEBFLOW_TOKEN}"
affiliate: false
tagline: "Webflow y CMS desde el chat"
originalAuthor: "Webflow"
originalAuthorUrl: "https://webflow.com"
license: "MIT"
licenseUrl: "https://unpkg.com/webflow-mcp-server@1.0.0/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
Tu sitio en Webflow puede tener páginas, colecciones y contenido CMS que cambian todo el tiempo. Con este conector, el agente puede trabajar contra la API de Webflow usando un token que guardás como secreto.

Para edición visual y puente con Designer, seguí la guía oficial de Webflow para AI tools y MCP Bridge App.

--- dev ---

`webflow-mcp-server` es el paquete publicado por Webflow para correr el MCP server local con `npx`. En instalación local usa `WEBFLOW_TOKEN` para autenticarse contra Webflow Data API; la documentación oficial también describe un modo remoto OAuth vía `mcp-remote`.

Licencia: MIT. Fuente: npm `webflow-mcp-server` y documentación oficial de Webflow AI tools.
