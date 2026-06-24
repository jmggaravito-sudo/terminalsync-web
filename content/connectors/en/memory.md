---
name: Memory
logo: /connectors/memory.svg
category: dev
status: available
simpleTitle: "Your AI remembers across conversations"
simpleSubtitle: "Save preferences, facts and relationships so the agent doesn't start from scratch every time."
devTitle: "Memory MCP Server"
devSubtitle: "Persistent local knowledge graph with entities, relations and observations."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory"
manifest:
  mcpServers:
    memory:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-memory"]
affiliate: false
tagline: "Persistent memory for the agent"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Every new conversation usually starts from scratch. With Memory, your AI can save facts like "I prefer Tailwind", relationships between entities, and observations worth remembering for the next session.

It works as a local knowledge graph for basic continuity across chats. No API key needed.

--- dev ---

`@modelcontextprotocol/server-memory` implements a local knowledge graph with entities, relations and observations. Exposes tools like `create_entities`, `create_relations`, `add_observations`, `read_graph`, `search_nodes` and `open_nodes`. No secrets required.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/memory.
