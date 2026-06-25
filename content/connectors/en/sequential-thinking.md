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
**Sequential Thinking** is a tool for tasks where the AI tends to jump to the answer before thinking it through. It gives structure to break the problem apart, write hypotheses, revise steps and correct course if it gets it wrong, instead of dropping the first idea that pops up.

It doesn't add new capabilities — it adds discipline. It's the difference between "let me answer right away" and "let me answer after looking at it from 3 angles." Especially useful when there's uncertainty, several variables in play, or when an early mistake would drag the whole result down.

### What you can ask

- *"I'm deciding between 3 corporate structures for my new company — think it through step by step, considering taxes, complexity, and my personal situation."*
- *"I have a strange bug: the app freezes only on Tuesdays at 3pm. Reason through possible causes before proposing a fix."*
- *"Plan the migration of my database to Postgres, considering I have 200 GB of data in production and can't have downtime."*

### What you need to configure

**Nothing.** No token, no account, no access to files or services required. It's a pure reasoning tool that lives inside the agent — install it and it's available.

Think of it as giving the agent a mental scratchpad where it can think out loud before speaking. Especially useful combined with other connectors: when the agent has to decide what to query in Sentry, which files to read from Filesystem, what query to run against Supabase, this connector helps it plan that sequence.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` exposes the `sequentialthinking` tool. Each step has `thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`. Supports revision (`isRevision`, `revisesThought`) and branching (`branchFromThought`, `branchId`). The server persists nothing — all state lives in the turn's tool call chain.

No secrets or configuration required. Good complement for multi-step tasks where the agent combines multiple MCPs.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
