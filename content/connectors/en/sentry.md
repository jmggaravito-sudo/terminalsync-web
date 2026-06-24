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
affiliate: false
tagline: "Production errors at chat distance"
originalAuthor: "Sentry"
originalAuthorUrl: "https://github.com/getsentry"
license: "FSL-1.1-ALv2"
licenseUrl: "https://github.com/getsentry/sentry-mcp/blob/master/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
A production error appears. Instead of opening Sentry, navigating issues, copying the stacktrace and pasting it into chat, the AI can query Sentry and help you understand what happened.

Requires a Sentry token stored as a secret. Don't paste real tokens into the manifest.

--- dev ---

`@sentry/mcp-server` is Sentry's official MCP server. In stdio mode it runs with `npx` and authenticates via `SENTRY_ACCESS_TOKEN`. The token must have permissions matching the projects you want to query.

License: FSL-1.1-ALv2. Source: github.com/getsentry/sentry-mcp.
