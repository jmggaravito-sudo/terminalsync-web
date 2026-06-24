---
name: Memory
logo: /connectors/memory.svg
category: dev
status: available
simpleTitle: "Tu IA recuerda entre conversaciones"
simpleSubtitle: "\"Acordate que prefiero Tailwind\", \"olvidate el contexto del workout\" — y de verdad lo recuerda."
devTitle: "Knowledge Graph Memory MCP"
devSubtitle: "Store local persistente de memoria. Entidades, relaciones, observaciones."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory"
manifest:
  mcpServers:
    memory:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-memory"]
affiliate: false
tagline: "Memoria persistente entre conversaciones"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Cada conversación nueva normalmente arranca de cero. Con esto no — tu IA recuerda qué decidiste la semana pasada, qué te gustó sobre tu stack, qué queda fuera de alcance.

Todo queda local; nada sale de tu computadora.

--- dev ---

`@modelcontextprotocol/server-memory` implementa un knowledge graph local. Operaciones: `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`. Store: archivo JSON en `MEMORY_FILE_PATH`.

Licencia: MIT.
