---
name: Sentry
logo: /connectors/sentry.svg
category: dev
status: available
simpleTitle: "Investigate errors in Sentry from your AI"
simpleSubtitle: "\"What's the latest error in checkout?\", \"summarize errors of the last hour\" — without opening Sentry."
devTitle: "Sentry MCP"
devSubtitle: "Sentry API access. Issues, events, stacktraces."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry"
affiliate: false
tagline: "Production errors at chat distance"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
A production error appears. Instead of opening Sentry, jumping between issues, copying the stacktrace, and pasting it into the chat, the AI does it for you: pull the latest error, summarize what's failing, suggest where to look.

Requires a Sentry token with read access to your org.

--- dev ---

`@modelcontextprotocol/server-sentry` requires `SENTRY_AUTH_TOKEN`. Operations: `get_sentry_issue` accepting a Sentry issue ID or URL. License: MIT.
