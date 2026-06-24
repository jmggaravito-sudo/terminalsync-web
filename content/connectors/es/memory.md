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
Cada conversación nueva normalmente arranca de cero. Con Memory, tu IA puede guardar hechos como "prefiero Tailwind", relaciones entre entidades y observaciones que conviene recordar para la próxima sesión.

Funciona como un grafo de conocimiento local para continuidad básica entre chats. No necesita API key.

--- dev ---

`@modelcontextprotocol/server-memory` implementa un knowledge graph local con entidades, relaciones y observaciones. Expone herramientas como `create_entities`, `create_relations`, `add_observations`, `read_graph`, `search_nodes` y `open_nodes`. No requiere secrets.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/memory.
