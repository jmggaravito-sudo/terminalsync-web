---
name: Sequential Thinking
logo: /connectors/sequential-thinking.svg
category: productivity
status: available
simpleTitle: "Your AI breaks down complex problems step by step"
simpleSubtitle: "Useful for plans, debugging and decisions with several variables before answering."
devTitle: "Sequential Thinking MCP Server"
devSubtitle: "Structured step-by-step reasoning tool with revision and branching support."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking"
manifest:
  mcpServers:
    sequential-thinking:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
affiliate: false
tagline: "Structured reasoning for hard tasks"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
For problems with many moving parts — picking an architecture, planning a refactor, investigating a tricky bug — the AI can jump to the conclusion too fast.

This connector gives it a tool to break the problem into steps, revise hypotheses and adjust the path before giving you a final answer.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` exposes the `sequentialthinking` tool, designed for step-by-step reasoning with revision and branching support. No secrets required.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
