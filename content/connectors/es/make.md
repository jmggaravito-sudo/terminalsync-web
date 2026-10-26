---
name: Make
logo: /connectors/make.svg
category: automation
markets: ["US"]
status: available
simpleTitle: "Ejecuta y gestiona tus automatizaciones de Make desde el chat"
simpleSubtitle: "MCP oficial de Make: ejecuta tus escenarios y revisa tu configuración de automatizaciones por OAuth, sin pegar ninguna API key."
devTitle: "Make MCP Connector"
devSubtitle: "MCP oficial hospedado de Make (mcp.make.com/v2) — ejecución de escenarios y gestión de automatizaciones por OAuth."
ctaUrl: "https://www.make.com"
tokenHelpUrl: "https://developers.make.com/mcp-server/connect-using-oauth"
manifest:
  mcpServers:
    make:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.make.com/v2"]
affiliate: false
tagline: "Tus automatizaciones de Make, al alcance del agente"
originalAuthor: "Make"
originalAuthorUrl: "https://developers.make.com/mcp-server/make-mcp-server"
license: "proprietary"
licenseUrl: "https://www.make.com/en/terms-and-conditions"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-26T22:41:23.000Z"
verifiedPackageVersion: null
---
**Make** es la plataforma de automatización visual que muchos negocios usan para conectar sus aplicaciones sin escribir código: un **escenario** está atento a algo que pasa — un pedido nuevo, una respuesta de formulario, una fila nueva en una hoja de cálculo — y luego ejecuta los pasos que configuraste en tus herramientas. El server MCP oficial de Make deja que tu agente dispare esos escenarios y gestione tu configuración de automatizaciones directamente — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Make.

Le pides *"Ejecuta ahora mi escenario 'Pedido nuevo'"* y el agente lo lanza y te trae el resultado. Le pides *"Muéstrame todos mis escenarios de Make y cuáles están activos"* y ves el panorama completo sin abrir Make. Sirve para ejecutar tus automatizaciones cuando las necesitas y revisar lo que está configurado: los escenarios, las conexiones que usan, los webhooks que los alimentan y los almacenes de datos que hay detrás.

Un dato para tener en cuenta, directo de la doc de Make: las herramientas para ejecutar escenarios están disponibles en todos los planes, mientras que las herramientas de gestión (ver y cambiar escenarios, conexiones, webhooks, almacenes de datos, equipos y organizaciones) están disponibles en planes de pago.

### Qué le puedes pedir

- *"Ejecuta ahora mismo mi escenario 'Pedido nuevo'."*
- *"Muéstrame todos mis escenarios de Make y cuáles están activos."*
- *"Lístame las conexiones que usan mis escenarios."*
- *"Muéstrame los webhooks por donde mis escenarios reciben datos."*
- *"¿A qué equipos y organizaciones pertenezco en Make?"*
- *"Agrega un almacén de datos que puedan usar mis escenarios."*

Antes de cualquier cosa que cambie tu configuración — ejecutar un escenario o modificar uno — tu agente te pide confirmación primero.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Make:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Make en tu navegador.
3. Elige tu organización y el acceso que quieres otorgar — la doc de Make lo dice claro: *"You select scopes when you connect Make MCP server to an MCP client."* El conector solo puede ver y hacer lo que esos permisos permitan. La guía oficial está en [developers.make.com](https://developers.make.com/mcp-server/make-mcp-server).

**Aclaración honesta:** es un server **hospedado por Make** (`https://mcp.make.com/v2`), no algo que corre en tu computadora. Los escenarios se ejecutan dentro de tu cuenta de Make, y lo que el agente puede ver o cambiar queda acotado por los permisos que apruebes y por los que tu cuenta ya tenga.

--- dev ---

Make publica un **server MCP remoto oficial** en `https://mcp.make.com/v2` — en sus propias palabras, un *"Make-hosted, cloud-based server that runs via stateless Streamable HTTP"* — documentado en `developers.make.com/mcp-server/make-mcp-server`. Esta es la variante del endpoint con OAuth. Make también documenta variantes con API key atadas a la zona de la organización (`https://<MAKE_ZONE>/mcp/v2` con `Authorization: Bearer`, o la clave embebida en el path de la URL) — no usadas aquí. La auth es OAuth contra la cuenta de Make del usuario; los permisos se eligen al conectar (*"You select scopes when you connect Make MCP server to an MCP client"*) y *"Scopes determine the tools available."*

TerminalSync usa el puente `mcp-remote` para conectar tu equipo con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.make.com/v2
```

Superficie de tools según la doc oficial — el server otorga a los clientes MCP tools que *"Run active and on-demand scenarios"*, *"View and modify scenarios and their related entities, such as connections, webhooks, and data stores"* y *"View and modify teams and organizations"*. La doc distingue **scenario run tools** de **management tools**, con el límite de planes verbatim: *"Scenario run tools are available to all plans, and management tools are available to paid plans."* Timeouts documentados por OAuth: 25s para ejecuciones de escenarios y 30s para tools de gestión (40s/60s con API key); tras el timeout de una ejecución, el escenario sigue corriendo en Make hasta 40 minutos y devuelve un `executionId` que se puede consultar después — esa consulta exige el scope `scenarios:read`. Los nombres de tools generadas tienen un tope de 56 caracteres por defecto (configurable entre 32 y 160 vía `?maxToolNameLength=`).

Make también publica `@makehq/mcp-server` en npm (MIT, repo `integromat/make-mcp-server`), pero su propia doc lo marca **"Make Local MCP Server (legacy)"** y recomienda el server en la nube — este conector shipea el hospedado.

Licencia: términos propietarios de SaaS (`www.make.com/en/terms-and-conditions`, verificado en vivo 2026-10-26 — la página confirma el Master Services Agreement). Fuente: developers.make.com/mcp-server/make-mcp-server.
