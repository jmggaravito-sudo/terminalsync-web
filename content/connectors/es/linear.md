---
name: Linear
logo: /connectors/linear.svg
category: productivity
markets: ["GLOBAL"]
status: available
simpleTitle: "Tus issues y proyectos, resueltos en lenguaje natural"
simpleSubtitle: "Server MCP oficial de Linear: busca, crea y actualiza issues, proyectos y comentarios por OAuth."
devTitle: "Conector MCP de Linear"
devSubtitle: "MCP oficial hospedado de Linear (mcp.linear.app/mcp) — issues, proyectos, comentarios, con opción de solo lectura."
ctaUrl: "https://linear.app"
tokenHelpUrl: "https://linear.app/docs/mcp"
manifest:
  mcpServers:
    linear:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.linear.app/mcp"]
affiliate: false
tagline: "El plan de tu equipo, al alcance del agente"
originalAuthor: "Linear"
originalAuthorUrl: "https://linear.app/docs/mcp"
license: "proprietary"
licenseUrl: "https://linear.app/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-12T14:38:42.430Z"
verifiedPackageVersion: null
---
**Linear** es el tracker de issues y proyectos que usan los equipos de producto y software para planificar su trabajo: issues, proyectos, ciclos y roadmaps en un solo lugar. El conector oficial de Linear es un **server MCP hospedado** (`https://mcp.linear.app/mcp`), hospedado y gestionado de forma centralizada por Linear, que le da a tu agente acceso para buscar, crear y actualizar issues, proyectos y comentarios con tu propia cuenta de Linear.

Pregúntale *"¿Qué está en riesgo en el ciclo actual?"* y lee los issues de tu equipo para resumir el estado. Dile *"Crea un bug para el error del checkout y asígnamelo"* y levanta el issue con los detalles. Sirve para las preguntas de siempre — qué está bloqueado, qué se entregó, qué viene — sin abrir el tablero.

### Qué le puedes pedir

- *"Resume qué entregamos este ciclo y qué se corrió de fecha."*
- *"Crea un issue de bug para el error del checkout y asígnamelo."*
- *"Busca todos los issues asignados a mí que están vencidos."*
- *"Pasa estas notas de la daily a actualizaciones del proyecto de roadmap."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Linear:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login OAuth de Linear en tu navegador — el cliente se registra solo, sin configurar ninguna app a mano.
3. Inicias sesión y autorizas el acceso. Lo que el agente puede ver o hacer queda acotado por tu propia cuenta y workspace de Linear.

**Aclaración honesta:** es un **server hospedado por Linear** (`https://mcp.linear.app/mcp`), no algo que corre en tu computadora. Por defecto este conector otorga acceso de lectura y escritura; Linear también ofrece un endpoint de solo lectura (`/mcp/readonly`) que expone únicamente tools de lectura.

--- dev ---

Linear publica su server MCP como **server remoto/hospedado**, hospedado y gestionado de forma centralizada, documentado en `linear.app/docs/mcp`. Endpoints: `https://mcp.linear.app/mcp` (lectura y escritura, Streamable HTTP), `https://mcp.linear.app/mcp/readonly` (solo lectura) y un `/sse` legacy (deprecado). No hay paquete stdio local: la propia doc de Linear da la config para clientes genéricos, que es exactamente el puente `mcp-remote`:

```
npx -y mcp-remote https://mcp.linear.app/mcp
```

La auth es **OAuth 2.1 con dynamic client registration** — sin app OAuth manual. Alternativa: pasar un token directo vía header `Authorization: Bearer <token>` (tokens OAuth o API keys de Linear, p. ej. una key restringida de solo lectura); los workspaces Enterprise pueden usar autorización gestionada por Okta.

Tools, según la doc oficial: *"tools available for finding, creating, and updating objects in Linear like issues, projects, and comments"*, con más por venir. Los casos de uso documentados incluyen planificación de roadmap, actualización de notas de daily, investigación de bugs, resúmenes de ciclo, timelines y planes de implementación.

Opciones de solo lectura: el endpoint `/mcp/readonly` *"only ever exposes read tools"*; o el endpoint estándar pidiendo únicamente el scope `read` de OAuth — *"Clients that request `read` are granted read-only access"* y el token no puede alcanzar las APIs de escritura. Una API key de Linear con solo el permiso `Read` habilitado funciona igual.

Licencia: términos SaaS propietarios (Linear Terms of Service, `linear.app/terms`). Fuente: linear.app/docs/mcp.
