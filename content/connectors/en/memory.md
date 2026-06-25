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
**Memory** is, in the official README's words, *"a basic implementation of persistent memory using a local knowledge graph. This lets Claude remember information about the user across chats."* It solves one of the oldest pains of working with AI: every new conversation starting from scratch.

The official model has three pieces: **entities** (graph nodes with a name, a type, and observations — e.g. *"Juan_Garavito"* of type *"person"* with observation *"prefers Tailwind"*); **relations** (directed connections between entities — e.g. *Juan_Garavito → works_at → NexFlowAI*); and **observations** (atomic facts as strings, one per data point).

### What you can ask

- *"Remember that my preferred tone for client emails is formal but warm, no emojis."*
- *"What did we decide last time we discussed the checkout redesign?"*
- *"Note that the 'La Mariposa' restaurant has issues with the vegan menu — keep it in mind next time we write to them."*

For the agent to get the most out of this, the official README recommends a short system prompt instructing it to *"identify the user and retrieve memory at the start of the conversation; record new facts at the end."* That way the notebook accumulates without you asking every time.

### What you need to configure

**Nothing.** No token, no external account, no folders. Memory lives on your own computer as a JSON file and the agent reads/writes it via the MCP tools.

The file path is configurable via the `MEMORY_FILE_PATH` env. If you don't set it, the file is born in the process cwd — better to pin it to an absolute path so it persists across sessions.

--- dev ---

`@modelcontextprotocol/server-memory` (official) exposes 9 tools verified against the README: `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`. No secrets required.

The backing store is a JSON file (path via `MEMORY_FILE_PATH` env); by default it lives in the process cwd. The README includes a reference "chat personalization" system prompt that's worth copying verbatim to the client so the agent uses the graph consistently.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/memory.
