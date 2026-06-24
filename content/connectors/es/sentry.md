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

Con este conector, tu IA puede leer Sentry directamente. En vez de abrir el panel, buscar el issue, copiar el stacktrace y pegárselo, le pedís en lenguaje natural lo que necesites y ella consulta y resume.

### Qué le podés pedir

- *"¿Cuál es el último error que apareció en producción?"*
- *"Resumime los 5 errores más frecuentes de la última semana y agrupalos por archivo."*
- *"Andá al issue #4521, leeme el stacktrace y decime cuál es la línea más sospechosa."*

### Qué token necesitás

Un **Sentry User Auth Token** con permisos de lectura en los proyectos que quieras consultar. Lo generás desde *Settings → Account → Auth Tokens → Create New Token* en tu cuenta de Sentry; el conector lo guarda como secreto cifrado, nunca queda en disco en texto plano.

Permisos mínimos sugeridos: `project:read`, `event:read`, `org:read`. No le des permisos de escritura si solo querés investigar.

--- dev ---

`@sentry/mcp-server` es el servidor MCP oficial de Sentry. En modo stdio corre con `npx` y se autentica vía `SENTRY_ACCESS_TOKEN`. Tools típicas: `get_issue`, `list_issues`, `get_event`, `search_events`.

El token debe tener scopes acordes a los proyectos que querés consultar. Para read-only: `project:read`, `event:read`, `org:read`. Para acciones de resolución/triage: agregar `event:write` e `issue:write`.

Modo remoto OAuth también disponible vía `mcp-remote` para equipos que prefieren no manejar tokens por usuario — ver docs del repo.

Licencia: FSL-1.1-ALv2. Fuente: github.com/getsentry/sentry-mcp.
