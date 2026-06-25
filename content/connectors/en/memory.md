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
**Memory** solves one of the oldest pains of working with AI: every new conversation starts from scratch. You explain your business again, your stack, your preferences, which client is which. Human memory pouring into an amnesiac agent.

This connector gives your agent its own notebook where it can write down important facts ("Juan prefers Tailwind over styled-components", "client X bills in USD", "grandma's chocolate cake recipe uses 3 eggs"). Every new conversation starts with that notebook available, so context accumulates instead of evaporating.

### What you can ask

- *"Remember that my preferred tone for client emails is formal but warm, no emojis."*
- *"What did we decide last time we discussed the checkout redesign?"*
- *"Note that the 'La Mariposa' restaurant has issues with the vegan menu — keep it in mind next time we write to them."*

### What you need to configure

**Nothing.** It doesn't ask for a token, doesn't ask for an external account, doesn't ask you to configure folders. The memory lives on your own computer (a small JSON file on disk) and the agent reads/writes it automatically when it needs to.

If you want to clear everything or export what it remembered, the file is in `~/.local/share/mcp-memory/` (or equivalent path depending on your system). It's yours.

--- dev ---

`@modelcontextprotocol/server-memory` implements a local knowledge graph with entities, relations and observations. Exposes tools like `create_entities`, `create_relations`, `add_observations`, `read_graph`, `search_nodes` and `open_nodes`. No secrets required.

The backing store is a JSON file (path configurable via env `MEMORY_FILE_PATH`); by default it lives in the process cwd, which you'll want to pin to an absolute path if you want it to persist across invocations from different sessions.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/memory.
