---
name: Google Drive
logo: /connectors/gdrive.svg
category: productivity
status: available
simpleTitle: "Your Drive talking to your AI (Anthropic version)"
simpleSubtitle: "Read documents, search files, summarize sheets — direct OAuth without intermediaries."
devTitle: "Google Drive MCP (Anthropic first-party)"
devSubtitle: "Direct OAuth to Drive. Files API + Docs/Sheets/Slides export."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive"
affiliate: false
tagline: "Drive direct, no middleman"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Note: this is the Anthropic first-party connector for Drive — different from the TerminalSync curated Google Drive connector. Both work; this one is the official Anthropic implementation included in the marketplace as a multi-IA alternative.

--- dev ---

`@modelcontextprotocol/server-gdrive` uses OAuth 2.0 with credentials file. Operations: `search`, file read, Google Docs/Sheets/Slides export to text/CSV. License: MIT.
