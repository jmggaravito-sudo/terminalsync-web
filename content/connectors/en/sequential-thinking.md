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
**Sequential Thinking** enables, in the official README's words, *"a detailed, step-by-step thinking process for problem-solving and analysis"*. It's built for tasks *"where the full scope might not be clear initially"* and where you need *"course correction"* — scenarios where the AI tends to jump to the conclusion before looking properly.

It gives structure to reasoning: each thought is numbered, you can revise a previous one (`isRevision`/`revisesThought`), or open a parallel branch with an alternative hypothesis (`branchFromThought`/`branchId`). It also lets you *"adjust the total number of thoughts dynamically"* and *"generate and verify solution hypotheses"*. It doesn't add new capabilities — it adds discipline.

### What you can ask

The three examples from the official README show what it's for:

- *"Plan a database migration from PostgreSQL 14 to 16, list risks, and revise the plan if downtime exceeds 5 minutes."*
- *"Debug why this deployment only fails in production and show your reasoning step by step."*
- *"Compare three architecture options for a file sync engine and branch if one assumption turns out to be wrong."*

### What you need to configure

**Nothing.** No token, no account, no access to files or services. It's a pure reasoning tool that lives inside the agent — install it and it's available.

Think of it as giving the agent a mental scratchpad to think out loud before speaking. Especially useful combined with other connectors: when the agent has to decide what to query in Sentry, which files to read from Filesystem, what query to run against Supabase, this connector helps it plan that sequence.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` (official) exposes the `sequentialthinking` tool. Each step has `thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`. Supports revision (`isRevision`, `revisesThought`) and branching (`branchFromThought`, `branchId`). `totalThoughts` adjusts dynamically.

The server persists nothing — all state lives in the turn's tool call chain. No secrets or configuration required.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
