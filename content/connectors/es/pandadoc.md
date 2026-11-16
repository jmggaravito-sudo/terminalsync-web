---
name: PandaDoc
logo: /connectors/pandadoc.png
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus propuestas y contratos, creados y enviados a firmar conversando"
simpleSubtitle: "Server MCP oficial de PandaDoc: crea documentos desde tus plantillas, envíalos a firmar y revisa su estado por OAuth."
devTitle: "Conector MCP de PandaDoc"
devSubtitle: "MCP oficial hospedado de PandaDoc (mcp.pandadoc.com) — documentos, plantillas, envío, seguimiento y firma."
ctaUrl: "https://www.pandadoc.com"
tokenHelpUrl: "https://developers.pandadoc.com/docs/getting-started-with-mcp"
manifest:
  mcpServers:
    pandadoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.pandadoc.com/v1/mcp"]
affiliate: false
tagline: "El papeleo que cierra ventas, al alcance del agente"
originalAuthor: "PandaDoc"
originalAuthorUrl: "https://developers.pandadoc.com/docs/getting-started-with-mcp"
license: "MIT"
licenseUrl: "https://github.com/PandaDoc/mcp-server-guide/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-16T14:28:17.460Z"
verifiedPackageVersion: null
---
**PandaDoc** es la plataforma con la que los equipos comerciales crean propuestas, presupuestos, contratos y acuerdos, los envían a firmar y hacen el seguimiento de cada firma. Su server MCP oficial lo describen así: *"PandaDoc MCP server for creating, sending, signing, and tracking PandaDoc documents"*. El conector es un **server MCP hospedado** (`https://mcp.pandadoc.com/v1/mcp`) con el que la documentación oficial lo plantea: *"so agents can read, create, and update your PandaDoc documents and templates"*.

Qué significa en la práctica: tu agente puede crear documentos desde tus plantillas (con tablas de precios y campos completados), enviarlos a firmar, revisar qué se firmó y qué sigue esperando, mandar recordatorios de los que están demorados, buscar entre tus documentos por cliente, monto o fecha, darles seguimiento con resúmenes y la pista de auditoría, y responder preguntas del estilo "¿cuánto tarda la gente en firmar mis propuestas?".

### Qué le puedes pedir

- *"Muéstrame los 5 documentos más recientes de mi cuenta y su estado."*
- *"Crea una propuesta de venta para Acme Corp usando nuestra plantilla de propuesta, con una tabla de precios: 3 licencias a $500 cada una y un 10% de descuento."*
- *"¿Qué contratos de más de $100.000 se firmaron el trimestre pasado?"*
- *"Mándales un recordatorio a los contratos con la etiqueta 'Q4' que todavía no se firmaron."*
- *"¿Cuál es el tiempo promedio que tardan en firmar mis propuestas?"*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de PandaDoc:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre la página de autorización de PandaDoc en tu navegador: apruebas el acceso (*"Allow access"*) y autorizas la conexión con tu cuenta.
3. Listo — al terminar la autorización, el agente queda conectado a tu cuenta de PandaDoc.

**Aclaración honesta:** es un **server hospedado por PandaDoc** (`https://mcp.pandadoc.com/v1/mcp`), no algo que corre en tu computadora, y hace **acciones reales sobre tu cuenta**: envía documentos a firmar, manda recordatorios y puede actualizar o caducar documentos — revísalo antes de aprobar cada envío. PandaDoc corre el server en **dos regiones** y *"each server returns only the documents and templates stored in its own region"*: este conector usa el server **global**; si tu cuenta está en la región europea (inicias sesión en `app.pandadoc.eu`), la autorización contra el server global falla — la sección técnica explica cómo apuntarlo al server europeo.

--- dev ---

PandaDoc (org oficial de GitHub `PandaDoc`) publica su server MCP como **server remoto/hospedado**, documentado en `developers.pandadoc.com/docs/getting-started-with-mcp` (repo oficial `github.com/PandaDoc/mcp-server-guide`, LICENSE MIT *"Copyright (c) 2026 PandaDoc"*; el server hospedado se sirve como SaaS bajo los términos de PandaDoc). El server está disponible en **dos regiones**, tabla oficial verbatim:

| Región | URL del server MCP |
|---|---|
| Global | `https://mcp.pandadoc.com/v1/mcp` |
| European (pandadoc.EU) | `https://mcp.pandadoc.eu/v1/mcp` |

*"If you sign in at `app.pandadoc.eu`, your account is in the European region and you must use the `mcp.pandadoc.eu` URL. Authentication fails if the region of the server URL doesn't match the region of your account."* El manifest del catálogo usa el **global**; para una cuenta europea, apuntar el puente al server europeo:

```
npx -y mcp-remote@latest https://mcp.pandadoc.eu/v1/mcp
```

La doc advierte además que *"There is no PandaDoc connector in the Claude connector directory for the European region"* — en Claude Desktop una cuenta de la UE se agrega como **custom connector** con la URL `mcp.pandadoc.eu/v1/mcp`. La autorización es OAuth con el login de PandaDoc en el navegador (flujo *"Allow access"* → *"Authorize"* documentado para cada cliente soportado); la doc lista los clientes soportados y da los pasos para Claude Desktop, Claude Code, Cursor, VS Code, Codex, OpenCode, Cline y Windsurf/Devin.

Superficie: la referencia oficial no publica una lista plana de tools MCP — la documenta como **librería de prompts** ("What You Can Do with PandaDoc MCP", `developers.pandadoc.com/docs/what-you-can-do-with-pandadoc-mcp`), organizada por categorías verbatim: Document Creation & Template Management (listar plantillas, crear documentos desde plantilla, subir un PDF como plantilla, inspeccionar roles/fields/tokens de una plantilla), Document Status & Management (verificar firma, detalles completos, marcar pagado, rechazar con nota), Bulk Operations & Reminders (documentos esperando firma, caducar borradores viejos, recordatorios por etiqueta, archivar), Document Search & Filtering (búsqueda por texto, por vencimiento, por etiqueta y estado, modificados recientemente), Analytics & Reporting (conteo por estado, pista de auditoría *"who viewed it, when, and what actions were taken"*, resúmenes con IA, reportes por rango de fechas), Document Lifecycle Management (crear → revisar → enviar, flujo de aprobación), Advanced Document Operations (extraer texto en markdown, actualizar bloques de texto, cláusulas de la content library) y Customer-Specific Workflows (documentos por cliente, reasignar remitente, firma multiparte). Ejemplos oficiales verbatim: *"Find all contracts worth more than $100,000 that were signed last quarter"*, *"What's the average time to sign proposals in the last month?"*, *"Before sending document doc_abc123, verify it's in draft status and show me its content for a final review"*.

Licencia: MIT (LICENSE del repo oficial `PandaDoc/mcp-server-guide`); el server hospedado se consume como SaaS propietario de PandaDoc. Fuente: developers.pandadoc.com/docs/getting-started-with-mcp + registro MCP (`com.pandadoc.mcp/mcp`).
