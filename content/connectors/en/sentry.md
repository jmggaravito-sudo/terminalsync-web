---
name: Sentry
logo: /connectors/sentry.svg
category: dev
status: available
simpleTitle: "Investigate production errors from your AI"
simpleSubtitle: "Pull context on issues, events and stacktraces without switching tools."
devTitle: "Sentry MCP Server"
devSubtitle: "Official Sentry MCP server for querying issues, events and project context."
ctaUrl: "https://github.com/getsentry/sentry-mcp"
manifest:
  mcpServers:
    sentry:
      command: npx
      args: ["-y", "@sentry/mcp-server"]
      env:
        SENTRY_ACCESS_TOKEN: "${SECRET:SENTRY_ACCESS_TOKEN}"
tokenHelpUrl: "https://sentry.io/settings/account/api/auth-tokens/"
affiliate: false
tagline: "Production errors at chat distance"
originalAuthor: "Sentry"
originalAuthorUrl: "https://github.com/getsentry"
license: "FSL-1.1-ALv2"
licenseUrl: "https://github.com/getsentry/sentry-mcp/blob/master/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Sentry** is the tool your team uses to find out about production errors: when an app fails, Sentry receives the alert, gathers the context, and builds an "issue" with the stacktrace, which user hit it, on which version, how many times it happened.

Sentry's official MCP server is, in the repo's own words, **"primarily designed for human-in-the-loop coding agents"** — it works as middleware over the Sentry API, optimized for Claude Code, Cursor and similar editors. The idea: investigate and fix errors without bouncing between your IDE and the Sentry panel.

### What you can ask

- *"What's the latest error in production and which line is firing it?"*
- *"Summarize the 5 most frequent issues from the last week and group them by file."*
- *"Go to issue #4521, read me the stacktrace, and tell me which commit most likely introduced it."*

The advanced search tools — `search_events` and `search_issues` — translate your natural-language question into Sentry's query syntax. For those the server **requires an LLM provider (OpenAI or Anthropic) configured**; basic tools like `get_issue` work without an LLM.

### What token you need

A **Sentry User Auth Token**. Generate it at *Settings → Account → Auth Tokens → Create New Token* in your Sentry account.

Scopes the official server documents as needed for the full tool set: `org:read`, `project:read`, `project:write`, `team:read`, `team:write`, `event:write`.

If you only want to investigate (no mutations), you can start with `org:read` + `project:read` + `event:read` and the server will narrow what it offers. For issue resolution/triage, add the `write` scopes. The token travels encrypted in your Keychain, never plaintext on disk.

--- dev ---

`@sentry/mcp-server` (Sentry, official) authenticates via `SENTRY_ACCESS_TOKEN` or `--access-token` CLI. It's a wrapper around the Sentry API focused on developer workflows: error investigation, trace/performance analysis, automated debugging.

Tools: `get_issue`, `list_issues`, `get_event`, `search_events`, `search_issues`, `update_issue`, etc. The two `search_*` require an LLM provider (OpenAI/Anthropic) configured via the server's own env.

Remote OAuth mode also available via `mcp-remote` for teams that prefer not to manage per-user tokens — see repo docs.

License: FSL-1.1-ALv2. Source: github.com/getsentry/sentry-mcp.
