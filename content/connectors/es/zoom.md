---
name: Zoom
logo: /connectors/zoom.svg
category: productivity
status: available
simpleTitle: "Encuentra lo que se dijo en tus reuniones de Zoom"
simpleSubtitle: "Server oficial de Zoom: resúmenes, transcripciones, grabaciones, chat y documentos, en lenguaje natural."
devTitle: "Zoom Workspace MCP Connector"
devSubtitle: "Official hosted Zoom Workspace MCP (mcp.zoom.us) — meetings, Team Chat and Docs over OAuth."
ctaUrl: "https://zoom.us"
tokenHelpUrl: "https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/"
manifest:
  mcpServers:
    zoom:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.zoom.us/mcp/zoom/streamable"]
affiliate: false
tagline: "Tus reuniones de Zoom, al alcance del agente"
originalAuthor: "Zoom"
originalAuthorUrl: "https://github.com/zoom/mcp-registry"
license: "MIT"
licenseUrl: "https://github.com/zoom/mcp-registry/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "productivity"
---
**Zoom** es la app de videollamadas que usas para tus reuniones de trabajo. El conector oficial de Zoom —el server **Zoom Workspace**, publicado por Zoom— te deja preguntarle en lenguaje natural a todo lo que quedó guardado de esas reuniones: resúmenes generados por IA, transcripciones, grabaciones, el chat del equipo y los documentos de Zoom, sin tener que abrir la app y buscar a mano. Es un **server hospedado** (`https://mcp.zoom.us/mcp/zoom/streamable`): corre en la nube de Zoom y te conectas con tu propia cuenta de Zoom, así que solo ve lo que tú ya puedes ver.

Le preguntas *"¿En qué reunión hablamos del presupuesto de la campaña?"* y busca entre tus reuniones, chats y documentos para encontrar el resumen, la transcripción o la grabación donde salió el tema. Le pedís *"Arma un documento de seguimiento con los próximos pasos de la reunión de ayer"* y crea un Zoom Doc nuevo a partir de las notas y los puntos de acción. Sirve para ubicar dónde se discutió algo, generar agendas, capturar notas, identificar tareas pendientes y armar documentos de seguimiento a partir de lo que ya quedó en Zoom.

### Qué le puedes pedir

- *"Busca en mis reuniones dónde hablamos del lanzamiento y traeme el resumen."*
- *"Muéstrame la grabación y los próximos pasos de la reunión con el cliente del martes."*
- *"Arma un documento de seguimiento en Zoom Docs con los puntos de acción de la reunión de ayer."*
- *"¿Qué se dijo en el chat del equipo sobre la fecha de entrega?"*

Directo de los ejemplos oficiales de Zoom: *"Search meeting content"* (buscar en reuniones, chat y docs), *"Review recording resources"* (traer resúmenes de grabaciones, próximos pasos y links de reproducción) y *"Create follow-up docs"* (generar un Zoom Doc nuevo desde Markdown con notas o tareas).

### Cómo conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Zoom:

1. Cuando lo actives, se abre una ventana del navegador para que inicies sesión en Zoom y autorices el acceso (OAuth).
2. Apruebas los permisos con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido.
3. Listo: no hay token que copiar ni que renovar a mano. La guía oficial de conexión de Zoom está en [developers.zoom.us](https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/).

**Aclaración honesta:** es un server **hospedado por Zoom** (no corre en tu computadora). Localmente se usa el puente `mcp-remote`, que abre el flujo de OAuth y mantiene la conexión con `https://mcp.zoom.us/mcp/zoom/streamable`. Lo que el agente puede ver o crear queda acotado por los permisos de tu cuenta de Zoom.

--- dev ---

Zoom publica **Zoom Workspace** como **server MCP remoto/hospedado** en `https://mcp.zoom.us/mcp/zoom/streamable` (transporte `streamable-http`). La fuente oficial es el repo `github.com/zoom/mcp-registry` (namespace `io.github.zoom/zoom-workspace`, versión 1.0.2, MIT) y la doc en `developers.zoom.us/docs/mcp/zoom/`. No hay comando stdio local: te conectas a la URL hospedada y localmente haces de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.zoom.us/mcp/zoom/streamable
```

La auth es **OAuth** contra tu cuenta de Zoom — `mcp-remote` abre el navegador para el login y no hay secret que inyectar (por eso el manifest no declara `env`). Zoom Workspace expone reuniones, Team Chat y Zoom Docs: recuperación en lenguaje natural de resúmenes generados por IA, transcripciones, grabaciones, documentos compartidos y assets de reunión, además de recursos de grabación como links de reproducción y próximos pasos; puede leer contenido de Zoom Docs, listar grabaciones en la nube y crear Zoom Docs de seguimiento desde Markdown. Zoom publica otros servers enfocados en el mismo endpoint base (`/mcp/meeting/streamable`, `/mcp/chat/streamable`, `/mcp/docs/streamable`, `/mcp/tasks/streamable`, etc.); este conector usa el de Workspace, el más amplio.
