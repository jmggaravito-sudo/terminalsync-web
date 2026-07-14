---
name: Context7
logo: /connectors/context7.svg
category: dev
status: available
simpleTitle: "Give your AI up-to-date docs for the tools you code with"
simpleSubtitle: "Official Upstash server: current, version-specific library docs — no more outdated answers."
devTitle: "Context7 MCP Connector"
devSubtitle: "Official @upstash/context7-mcp: resolve-library-id + get-library-docs. Keyless by default."
ctaUrl: "https://context7.com"
manifest:
  mcpServers:
    context7:
      command: npx
      args: ["-y", "@upstash/context7-mcp"]
affiliate: false
tagline: "Fresh docs, straight into the prompt"
originalAuthor: "Upstash"
originalAuthorUrl: "https://github.com/upstash"
license: "MIT"
licenseUrl: "https://github.com/upstash/context7/blob/master/LICENSE"
---
**Context7** solves a quiet but constant problem: AI models are trained on a snapshot of the past, so when you ask about a library or framework they often answer with **outdated APIs and functions that no longer exist**. Context7, built by Upstash, pulls **current, version-specific documentation and real code examples** straight from the source and drops them into the prompt — so the answer matches the version you're actually using.

You don't really "ask Context7" things directly — it works in the background. When you're coding and say *"use Context7"*, or the agent notices it needs current docs, it looks up the right library and fetches its up-to-date reference before answering. The difference is fewer made-up functions and fewer "that doesn't work" moments.

### What you can ask

- *"Set up a Next.js 15 middleware for auth. use context7"* — it pulls the current Next.js docs, not a 2023 memory.
- *"How do I do a batched write in the latest Supabase JS client? use context7"*
- *"Show me the current Tailwind v4 config format. use context7"*

### Setup

Nothing to configure — it works out of the box, no key required. If you hit rate limits or need private repositories, you can optionally create a free API key at [context7.com/dashboard](https://context7.com/dashboard) and add it later; for normal use you won't need one.

--- dev ---

`@upstash/context7-mcp` (Upstash, official — repo `upstash/context7`) runs via `npx -y @upstash/context7-mcp`. Two tools per the README: `resolve-library-id` (map a library name to Context7's internal id) and `get-library-docs` (fetch current, version-scoped docs + examples for that id). Designed to be chained: resolve, then pull docs, then answer.

**Keyless by default** — this manifest ships no secret, so it's a true one-click install. A `CONTEXT7_API_KEY` (or `--api-key` flag) is *optional*, only needed for higher rate limits and private/added repositories; get one at context7.com/dashboard. A remote HTTP endpoint (`https://mcp.context7.com/mcp`) also exists if you prefer not to run the local process.

Terminal Sync installs it as a plain `npx` server; when you add the optional key, it's kept in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: github.com/upstash/context7.
