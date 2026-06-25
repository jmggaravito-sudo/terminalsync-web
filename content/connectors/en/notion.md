---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Give your assistant superpowers with Notion"
simpleSubtitle: "So your AI reads your recipes, notes and projects without copy-paste."
devTitle: "Notion MCP Connector"
devSubtitle: "Official Notion MCP server: data sources, pages, comments, search, markdown."
ctaUrl: "https://www.notion.so"
tokenHelpUrl: "https://www.notion.so/profile/integrations"
manifest:
  mcpServers:
    notion:
      command: npx
      args: ["-y", "@notionhq/notion-mcp-server"]
      env:
        NOTION_API_KEY: "${SECRET:NOTION_API_KEY}"
affiliate: false
tagline: "Let your AI understand your workspace"
originalAuthor: "Notion Labs (@makenotion)"
originalAuthorUrl: "https://github.com/makenotion"
license: "MIT"
licenseUrl: "https://github.com/makenotion/notion-mcp-server/blob/main/LICENSE"
---
**Notion** is where many people keep years of work: recipes, client notes, team decisions, links, project plans, internal handbooks. The official connector — maintained by Notion Labs — implements an *"MCP server for the Notion API"* and exposes 22 tools covering data sources (databases), pages, comments, search, and content-to-Markdown conversion.

With this connector, the agent reads your workspace directly (with your permission) and answers from **your** knowledge. Ask *"what did we decide with client X last month?"* and it goes to the right doc. Ask *"add a comment on the Getting Started page"* and it writes it.

### What you can ask

- *"Read my '2026 Meetings' database and summarize the 3 most important decisions from March."*
- *"Create a new page inside 'Recipes' titled 'Lemon Pasta' with this ingredient list and steps."*
- *"Search my workspace for any mention of 'pricing' and bring me the relevant paragraphs."*

> **Official note from the repo:** *"While we limit the scope of Notion API's exposed (for example, you will not be able to delete databases via MCP), there is a non-zero risk to workspace data by exposing it to LLMs."* Share only what you need the agent to see.

### What token you need

You need a Notion **Internal Integration**, which generates a `secret_xxx`-style token.

1. Go to [notion.so/profile/integrations](https://www.notion.so/profile/integrations).
2. Click "+ New integration". Name it something like "Terminal Sync — Claude". Capabilities: leave the defaults (Read content, Update content, Insert content) or adjust to taste.
3. Save and copy the "Internal Integration Secret".
4. **Important** — Notion requires you to explicitly share each page or database with the integration. Two ways: (a) in your integration's Access tab pick pages/databases; (b) per page, open the "..." menu → Connect to integration → pick yours. What you don't share, it can't see.
5. Paste the token when the Lab asks for `NOTION_API_KEY`. Encrypted in your Keychain.

If you share only one parent page, the agent gets all its children. If you want tighter scope, share only specific databases.

--- dev ---

`@notionhq/notion-mcp-server` (officially maintained by Notion Labs) exposes 22 tools over the Notion REST API, grouped into: data source ops (query/retrieve/update/create), page management (create/retrieve/update/move), content-as-markdown (2 tools for token efficiency), search (pages + data sources), comments (add to pages), database metadata.

Permission model: opt-in per page. The integration's token only accesses pages/databases explicitly shared from the UI. No workspace-wide scope; always per-page tree. The server limits destructive ops (no database deletion via MCP).

Terminal Sync syncs `claude_desktop_config.json` encrypted across machines. The secret lives in Keychain via `apiKeyHelper`, never plaintext on disk.

License: MIT. Source: github.com/makenotion/notion-mcp-server.
