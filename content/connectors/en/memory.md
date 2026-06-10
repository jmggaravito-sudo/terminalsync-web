---
name: Memory
logo: /connectors/memory.svg
category: dev
status: available
simpleTitle: "Your AI remembers across conversations"
simpleSubtitle: "\"Remember I prefer Tailwind\", \"forget the workout context\" — and it actually remembers."
devTitle: "Knowledge Graph Memory MCP"
devSubtitle: "Local persistent memory store. Entities, relations, observations."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory"
affiliate: false
tagline: "Persistent memory across conversations"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Each new conversation usually starts from scratch. With this, no — your AI remembers what you decided last week, what you said about your stack, what stays out of scope.

Everything stays local; nothing leaves your computer.

--- dev ---

`@modelcontextprotocol/server-memory` implements a local knowledge graph. Operations: `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`. Store: JSON file at `MEMORY_FILE_PATH`.

License: MIT.
