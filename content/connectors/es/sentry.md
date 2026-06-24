---
name: Sentry
logo: /connectors/sentry.svg
category: dev
status: available
simpleTitle: "Investigá errores de producción desde tu IA"
simpleSubtitle: "Pedile contexto de issues, eventos y stacktraces sin cambiar de herramienta."
devTitle: "Sentry MCP Server"
devSubtitle: "Official Sentry MCP server for querying issues, events and project context."
ctaUrl: "https://github.com/getsentry/sentry-mcp"
manifest:
  mcpServers:
    sentry:
      command: npx
      args: ["-y", "@sentry/mcp-server"]
      env:
        SENTRY_ACCESS_TOKEN: "${SECRET:SENTRY_ACCESS_TOKEN}"
affiliate: false
tagline: "Errores de producción a distancia de chat"
originalAuthor: "Sentry"
originalAuthorUrl: "https://github.com/getsentry"
license: "FSL-1.1-ALv2"
licenseUrl: "https://github.com/getsentry/sentry-mcp/blob/master/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
Aparece un error en producción. En vez de abrir Sentry, navegar issues, copiar el stacktrace y pegarlo en el chat, la IA puede consultar Sentry y ayudarte a entender qué pasó.

Requiere un token de Sentry guardado como secreto. No pegues tokens reales en el manifest.

--- dev ---

`@sentry/mcp-server` es el servidor MCP oficial de Sentry. En modo stdio puede correr con `npx` y autenticarse con `SENTRY_ACCESS_TOKEN`. El token debe tener permisos acordes a los proyectos que querés consultar.

Licencia: FSL-1.1-ALv2. Fuente: github.com/getsentry/sentry-mcp.
