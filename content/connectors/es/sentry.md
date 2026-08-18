---
name: Sentry
logo: /connectors/sentry.svg
category: dev
status: available
simpleTitle: "Investiga errores de producción desde tu IA"
simpleSubtitle: "Pídele contexto de issues, eventos y stacktraces sin cambiar de herramienta."
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
tokenHelpUrl: "https://sentry.io/settings/account/api/auth-tokens/"
affiliate: false
tagline: "Errores de producción a distancia de chat"
originalAuthor: "Sentry"
originalAuthorUrl: "https://github.com/getsentry"
license: "FSL-1.1-ALv2"
licenseUrl: "https://github.com/getsentry/sentry-mcp/blob/master/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Sentry** es la herramienta que tu equipo usa para enterarse de errores en producción: cuando una app falla, Sentry recibe el aviso, junta el contexto y arma un "issue" con el stacktrace, qué usuario lo vivió, en qué versión, cuántas veces pasó.

El servidor MCP oficial de Sentry está pensado, en palabras del propio repo, **"primarily designed for human-in-the-loop coding agents"** — funciona como middleware sobre la Sentry API, optimizado para Claude Code, Cursor y editores similares. La idea: investigar y arreglar errores sin saltar entre tu IDE y el panel de Sentry.

### Qué le puedes pedir

- *"¿Cuál es el último error que apareció en producción y qué línea lo dispara?"*
- *"Resúmeme los 5 issues más frecuentes de la última semana y agrupalos por archivo."*
- *"Anda al issue #4521, leeme el stacktrace y dime cuál es el commit más probable que lo introdujo."*

Las herramientas avanzadas de búsqueda — `search_events` y `search_issues` — traducen tu pregunta en lenguaje natural a la sintaxis de query de Sentry. Para eso el server **requiere un LLM provider configurado (OpenAI o Anthropic)**; las tools básicas como `get_issue` funcionan sin LLM.

### Qué token necesitas

Un **Sentry User Auth Token**. Lo generas en *Settings → Account → Auth Tokens → Create New Token* en tu cuenta de Sentry.

Scopes que el server oficial documenta como necesarios para el set completo de tools: `org:read`, `project:read`, `project:write`, `team:read`, `team:write`, `event:write`.

Si solo quieres investigar (sin tocar nada), puedes arrancar con `org:read` + `project:read` + `event:read` y el server limitará lo que ofrece. Para resolver/triage de issues, agrega los `write`. El token viaja cifrado en tu Keychain, nunca queda en disco en texto plano.

--- dev ---

`@sentry/mcp-server` (Sentry, oficial) se autentica vía `SENTRY_ACCESS_TOKEN` o `--access-token` CLI. Es un wrapper alrededor de la Sentry API enfocado en developer workflows: error investigation, trace/performance analysis, automated debugging.

Tools: `get_issue`, `list_issues`, `get_event`, `search_events`, `search_issues`, `update_issue`, etc. Las dos `search_*` requieren un LLM provider (OpenAI/Anthropic) configurado vía env del propio server.

Modo remoto OAuth también disponible vía `mcp-remote` para equipos que prefieren no manejar tokens por usuario — ver docs del repo.

Licencia: FSL-1.1-ALv2. Fuente: github.com/getsentry/sentry-mcp.
