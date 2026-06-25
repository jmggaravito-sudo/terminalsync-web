---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Give your assistant superpowers with Notion"
simpleSubtitle: "So your AI reads your recipes, notes and projects without copy-paste."
devTitle: "Notion MCP Connector"
devSubtitle: "Expose Notion databases + pages to Claude Code via the Model Context Protocol."
ctaUrl: "https://www.notion.so"
tokenHelpUrl: "https://www.notion.so/my-integrations"
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
**Notion** is where many people keep years of work: recipes, client notes, team decisions, links, project plans, internal handbooks. It's the most complete knowledge base you have — but until today, every time you asked Claude something you had to copy-paste context.

With this connector, the agent reads your Notion workspace directly (with your permission) and answers from **your** knowledge. Ask *"what did we decide with client X last month?"* and it goes to the right doc. Ask *"draft a meeting brief based on this week's notes"* and it builds it from the actual blocks, no hallucination.

### What you can ask

- *"Read my '2026 Meetings' database and summarize the 3 most important decisions from March."*
- *"Create a new page inside 'Recipes' titled 'Lemon Pasta' with this ingredient list and steps."*
- *"Search my workspace for any mention of 'pricing' and bring me the relevant paragraphs."*

### What token you need

You need a **Notion Integration** (Internal Integration), which generates a `secret_xxx`-style token.

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Click "+ New integration". Name it something like "Terminal Sync — Claude". Capabilities: leave the defaults (Read content, Update content, Insert content) or adjust to taste.
3. Save and copy the "Internal Integration Secret".
4. **Important** — Notion requires you to explicitly share each page or database with the integration. Go to the root page/database you want the agent to see, open the "..." menu → Connections → find your integration → Confirm. What you don't share, it can't see.
5. Paste the token when the Lab asks for `NOTION_API_KEY`. It travels encrypted in your Keychain.

If you share only one parent page, the agent gets all its children. If you want tighter scope, share only specific databases.

--- dev ---

`@notionhq/notion-mcp-server` (officially maintained by Notion Labs) exposes databases, pages and blocks as tools over the Notion REST API. Key tools: `notion_search`, `notion_get_page`, `notion_query_database`, `notion_create_page`, `notion_update_block_children`.

The permission model is opt-in per page: the integration's token only accesses pages/databases explicitly shared from the UI. No workspace-wide scope; always per-page tree.

Terminal Sync syncs `claude_desktop_config.json` encrypted across machines. The secret lives in Keychain via `apiKeyHelper`, never plaintext on disk.

License: MIT. Source: github.com/makenotion/notion-mcp-server.
