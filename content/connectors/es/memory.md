---
name: Memory
logo: /connectors/memory.svg
category: dev
status: available
simpleTitle: "Tu IA recuerda entre conversaciones"
simpleSubtitle: "Guardá preferencias, hechos y relaciones para que el agente no arranque de cero cada vez."
devTitle: "Memory MCP Server"
devSubtitle: "Persistent local knowledge graph with entities, relations and observations."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory"
manifest:
  mcpServers:
    memory:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-memory"]
affiliate: false
tagline: "Memoria persistente para el agente"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Memory** resuelve uno de los dolores más viejos de trabajar con IA: cada conversación nueva arranca de cero. Le contás otra vez tu negocio, tu stack, tus preferencias, qué cliente es cuál. Memoria humana hacia un agente sin memoria.

Este conector le da a tu agente un cuaderno propio donde puede ir anotando hechos importantes ("Juan prefiere Tailwind sobre styled-components", "el cliente X factura en USD", "la receta de la torta de chocolate de la abuela usa 3 huevos"). Cada conversación nueva empieza con ese cuaderno disponible, así que el contexto se acumula en vez de evaporarse.

### Qué le podés pedir

- *"Recordá que mi tono preferido para emails de clientes es formal pero cálido, sin emojis."*
- *"¿Qué decidimos la última vez que hablamos del rediseño del checkout?"*
- *"Anotá que el restaurante 'La Mariposa' tiene problemas con el menú vegano — para tenerlo en cuenta la próxima vez que les escribamos."*

### Qué necesitás configurar

**Nada.** No pide token, no pide cuenta externa, no pide configurar carpetas. La memoria vive en tu propia computadora (un archivito JSON en disco) y el agente la lee/escribe automáticamente cuando lo necesita.

Si querés borrar todo o exportar lo que recordó, el archivo está en `~/.local/share/mcp-memory/` (o ruta equivalente según tu sistema). Es tuyo.

--- dev ---

`@modelcontextprotocol/server-memory` implementa un knowledge graph local con entidades, relaciones y observaciones. Expone herramientas como `create_entities`, `create_relations`, `add_observations`, `read_graph`, `search_nodes` y `open_nodes`. No requiere secrets.

El backing store es un JSON file (path configurable via env `MEMORY_FILE_PATH`); por default vive en el cwd del proceso, lo cual conviene fijar a una ruta absoluta si querés que persista entre invocaciones de distintas sesiones.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/memory.
