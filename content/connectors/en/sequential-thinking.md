---
name: Sequential Thinking
logo: /connectors/sequential-thinking.svg
category: productivity
status: available
simpleTitle: "Your AI thinks step by step on complex problems"
simpleSubtitle: "For decisions with many variables — it lays out the reasoning before answering."
devTitle: "Sequential Thinking MCP"
devSubtitle: "Tool that exposes a stepwise reasoning scratchpad to the model."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking"
manifest:
  mcpServers:
    sequential-thinking:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
affiliate: false
tagline: "Structured stepwise reasoning"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
For problems with many variables — choosing between architectures, planning a multi-step refactor, weighing pros and cons — the AI tends to skip ahead.

This connector gives the model a "scratchpad" where it lays out the reasoning step by step before answering.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` exposes `sequentialthinking` with branching/revising support. The model emits structured thoughts, can revise previous steps, and reaches a more justified conclusion.

License: MIT.
