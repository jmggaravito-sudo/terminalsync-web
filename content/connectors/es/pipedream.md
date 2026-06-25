---
name: Pipedream
logo: /connectors/pipedream.svg
category: automation
status: available
simpleTitle: "Conectá tu IA a miles de apps"
simpleSubtitle: "Que ejecute acciones aprobadas en Slack, Gmail, Sheets, GitHub y más desde Pipedream."
devTitle: "Pipedream MCP Connector"
devSubtitle: "Servidor oficial @pipedream/mcp: stdio local o SSE self-hosted sobre Pipedream Connect."
ctaUrl: "https://pipedream.com/docs/connect/mcp/users"
tokenHelpUrl: "https://pipedream.com/docs/rest-api/auth/#creating-an-oauth-client"
manifest:
  mcpServers:
    pipedream:
      command: npx
      args: ["-y", "@pipedream/mcp", "stdio", "--app", "${SECRET:PIPEDREAM_APP}", "--external-user-id", "${SECRET:PIPEDREAM_EXTERNAL_USER_ID}"]
      env:
        PIPEDREAM_CLIENT_ID: "${SECRET:PIPEDREAM_CLIENT_ID}"
        PIPEDREAM_CLIENT_SECRET: "${SECRET:PIPEDREAM_CLIENT_SECRET}"
        PIPEDREAM_PROJECT_ID: "${SECRET:PIPEDREAM_PROJECT_ID}"
        PIPEDREAM_PROJECT_ENVIRONMENT: "development"
affiliate: false
tagline: "Miles de acciones de apps vía Pipedream"
originalAuthor: "Pipedream, Inc."
originalAuthorUrl: "https://www.npmjs.com/package/@pipedream/mcp"
license: "Pipedream Source Available License 1.0"
licenseUrl: "https://github.com/PipedreamHQ/pipedream/blob/master/LICENSE"
hidden: true
marketplaceSource: "official"
---
**Pipedream** conecta apps y APIs para automatizar trabajos que normalmente te obligan a abrir cinco pestañas: mensajes, planillas, tickets, calendarios, bases de datos y herramientas internas.

Este conector deja que tu IA use la capa MCP oficial de Pipedream para una app concreta, como Slack, Gmail, GitHub, Google Sheets o miles más. La documentación de Pipedream resume la promesa como sumar *"10,000+ tools from 3,000+ APIs"* a herramientas de IA, con la conexión de cuentas manejada por Pipedream.

### Qué le podés pedir

- *"Buscá las respuestas nuevas de Typeform y agregá los leads calificados a Google Sheets."*
- *"Creá un issue de GitHub con esta nota del cliente y mandá el link por Slack."*
- *"Revisá las reuniones de hoy y armá un borrador de seguimiento para cada una."*

### Qué configuración necesitás

Necesitás un **proyecto de Pipedream** y credenciales de un cliente OAuth. También elegís el slug de la app para este server MCP — por ejemplo `slack`, `gmail`, `github` o `google_sheets`.

1. Creá o abrí un proyecto en Pipedream.
2. Creá un cliente OAuth de Pipedream desde la configuración de autenticación de la REST API.
3. Copiá el client ID, el client secret y el project ID.
4. Elegí el slug de la app que querés exponer con este server. Pipedream muestra los slugs en la sección Authentication de cada app.
5. Pegá esos valores cuando el Lab te pida `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_APP` y `PIPEDREAM_EXTERNAL_USER_ID`. Terminal Sync los guarda cifrados en tu Keychain.

Arrancá con una app por vez. Pipedream puede llegar a muchísimas herramientas, así que limitar el slug de app es la forma más simple de que la primera instalación sea clara.

--- dev ---

`@pipedream/mcp` es el paquete npm oficial publicado por maintainers de Pipedream. Paquete verificado: `@pipedream/mcp@0.0.1`, dist-tag `latest` solamente (sin tag canary). Entrypoints verificados: `npx -y @pipedream/mcp --help`, `npx -y @pipedream/mcp stdio --help` y arranque SSE con credenciales dummy vivo hasta terminarlo manualmente.

El manifest usa stdio: `npx -y @pipedream/mcp stdio --app ${SECRET:PIPEDREAM_APP} --external-user-id ${SECRET:PIPEDREAM_EXTERNAL_USER_ID}` con `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID` y `PIPEDREAM_PROJECT_ENVIRONMENT` en `env`. El README documenta esas mismas variables y dice que el modo stdio levanta un server para un slug de app.

Las tools se registran dinámicamente desde componentes de Pipedream para la app elegida. La implementación llama `getComponents({ app, componentType: "action" })`, registra cada key de componente como tool MCP y además registra `configure_component` para buscar opciones paso a paso. Gotcha: sin credenciales OAuth válidas de Pipedream, stdio sale al intentar obtener el access token; por eso el gate local verifica CLI y transportes, y la hidratación completa de tools depende de credenciales reales.

Terminal Sync mantiene las credenciales de Pipedream en Keychain vía `apiKeyHelper`, sincronizadas cifradas con AES-256-GCM entre máquinas.

Licencia: Pipedream Source Available License 1.0. Fuente: README oficial y package metadata de `@pipedream/mcp` en npm, más docs MCP de Pipedream.
