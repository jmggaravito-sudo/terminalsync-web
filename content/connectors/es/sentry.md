---
name: Sentry
logo: /connectors/sentry.svg
category: dev
status: available
simpleTitle: "Investigá errores en Sentry desde tu IA"
simpleSubtitle: "\"¿Cuál es el último error en checkout?\", \"resumime los errores de la última hora\" — sin abrir Sentry."
devTitle: "Sentry MCP"
devSubtitle: "Acceso a la API de Sentry. Issues, events, stacktraces."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry"
manifest:
  mcpServers:
    sentry:
      command: npx
      args: ["-y", "@sentry/mcp-server"]
      env:
        SENTRY_ACCESS_TOKEN: "${SECRET:SENTRY_ACCESS_TOKEN}"
affiliate: false
tagline: "Errores de producción a distancia de chat"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Aparece un error en producción. En vez de abrir Sentry, navegar issues, copiar el stacktrace, pegarlo en el chat — la IA lo hace por vos: trae el último error, te lo resume, sugiere dónde mirar.

Requiere un token de Sentry con read access a tu org.

--- dev ---

`@modelcontextprotocol/server-sentry` requiere `SENTRY_AUTH_TOKEN`. Operaciones: `get_sentry_issue` aceptando un ID o URL de issue de Sentry. Licencia: MIT.
