---
name: Asana
logo: /connectors/asana.svg
category: productivity
status: available
simpleTitle: "Preguntale a tus proyectos de Asana cómo van"
simpleSubtitle: "MCP oficial de Asana: tareas, proyectos y estados por OAuth, sin pegar ninguna API key."
devTitle: "Asana MCP Connector"
devSubtitle: "Official hosted Asana MCP (mcp.asana.com/v2/mcp) — tasks and project data through OAuth."
ctaUrl: "https://asana.com"
tokenHelpUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
manifest:
  mcpServers:
    asana:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.asana.com/v2/mcp"]
affiliate: false
tagline: "Tu workspace de Asana, al alcance del agente"
originalAuthor: "Asana"
originalAuthorUrl: "https://developers.asana.com/docs/using-asanas-mcp-server"
license: "proprietary"
licenseUrl: "https://asana.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Asana** es el gestor de tareas y proyectos que usan los equipos para organizar el trabajo: quién hace qué, para cuándo, y en qué proyecto. El server MCP oficial de Asana deja que tu agente lea y gestione ese workspace directamente — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Asana.

Le preguntás *"Buscá todas mis tareas incompletas que vencen esta semana"* y el agente las trae directo de tu workspace. Le pedís *"Creá una tarea nueva en el proyecto de Marketing asignada a mí"* y queda creada sin abrir Asana. Sirve para chequear el estado de las cosas, crear y actualizar tareas, y entender qué se está moviendo en tus proyectos.

### Qué le podés pedir

- *"Buscá todas mis tareas incompletas que vencen esta semana."*
- *"Creá una tarea nueva en el proyecto de Marketing asignada a mí."*
- *"Listame todas las secciones del proyecto Product Launch."*
- *"Mostrame el estado del proyecto Q2 Planning."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Asana:

1. Activá el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Asana en tu navegador y te pide autorizar el acceso.
3. Aprobalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido. La guía oficial de Asana está en [developers.asana.com](https://developers.asana.com/docs/using-asanas-mcp-server).

**Aclaración honesta:** es un server **hospedado por Asana** (`https://mcp.asana.com/v2/mcp`), no algo que corre en tu computadora. Lo que el agente puede ver o cambiar queda acotado por los permisos de tu workspace de Asana.

--- dev ---

Asana publica un **server MCP remoto oficial (V2)** en `https://mcp.asana.com/v2/mcp`, documentado en `developers.asana.com/docs/using-asanas-mcp-server`. El beta anterior (`v1`, servido en `/sse`) está programado por Asana para apagarse el 05/11/2026 — este conector apunta a V2. El transporte es Streamable HTTP; la auth es OAuth contra la cuenta de Asana del usuario (la doc dice, verbatim: *"This server requires authentication with your Asana account. When connecting, you'll be prompted to authorize the application to access your Asana data."*).

TerminalSync hace de puente con el endpoint hospedado localmente:

```
npx -y mcp-remote@latest https://mcp.asana.com/v2/mcp
```

La doc de Asana no publica una lista estática de tools en la página; dirige a los clientes a llamar `tools/list` contra el server en vivo para enumerar las tools disponibles. Las capacidades de ejemplo documentadas cubren buscar/filtrar tareas, crear tareas, listar secciones de proyecto, y chequear el estado de un proyecto.

Licencia: términos propietarios de SaaS (`asana.com/terms`). Fuente: developers.asana.com/docs/using-asanas-mcp-server.
