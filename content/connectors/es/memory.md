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
**Memory** es, en palabras del README oficial, *"a basic implementation of persistent memory using a local knowledge graph. This lets Claude remember information about the user across chats."* Resuelve uno de los dolores más viejos de trabajar con IA: que cada conversación arranque de cero.

El modelo del oficial tiene tres piezas: **entidades** (nodos del grafo con un nombre, un tipo, y observaciones — por ejemplo *"Juan_Garavito"* tipo *"persona"* con observación *"prefiere Tailwind"*); **relaciones** (conexiones direccionales entre entidades — por ejemplo *Juan_Garavito → works_at → NexFlowAI*); y **observaciones** (hechos atómicos como strings, uno por dato).

### Qué le podés pedir

- *"Recordá que mi tono preferido para emails de clientes es formal pero cálido, sin emojis."*
- *"¿Qué decidimos la última vez que hablamos del rediseño del checkout?"*
- *"Anotá que el restaurante 'La Mariposa' tiene problemas con el menú vegano — para tenerlo en cuenta la próxima vez que les escribamos."*

Para que el agente lo aproveche al máximo, el README oficial recomienda un system prompt corto que le diga: *"al inicio de la conversación, identificá al usuario y consultá la memoria; al final, anotá hechos nuevos."* Así el cuaderno se acumula sin que vos tengas que pedirlo cada vez.

### Qué necesitás configurar

**Nada.** No pide token, no pide cuenta externa, no pide carpetas. La memoria vive en tu propia computadora como un archivo JSON y el agente la lee/escribe vía las tools del MCP.

El path del archivo es configurable vía la env `MEMORY_FILE_PATH`. Si no la setteás, el archivo nace en el cwd del proceso — conviene fijarlo a una ruta absoluta para que persista entre sesiones.

--- dev ---

`@modelcontextprotocol/server-memory` (oficial) expone 9 tools verificadas contra el README: `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`. No requiere secrets.

El backing store es un JSON file (path vía env `MEMORY_FILE_PATH`); por default vive en el cwd del proceso. El README incluye un system prompt de referencia para "chat personalization" que vale la pena copiar tal cual al cliente para que el agente use el grafo de forma consistente.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/memory.
