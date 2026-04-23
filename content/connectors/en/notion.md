---
name: Notion
logo: /connectors/notion.svg
category: productivity
status: available
simpleTitle: "Give your assistant superpowers with Notion"
simpleSubtitle: "So your AI can read your recipes, notes and projects without you copy-pasting every time."
devTitle: "Notion MCP Connector"
devSubtitle: "Expose Notion databases + pages to Claude Code via the Model Context Protocol."
ctaUrl: "https://affiliate.notion.so/REPLACE_WITH_JUANS_NOTION_AFFILIATE"
affiliate: true
tagline: "Make your AI understand your workspace"
---

Your Notion has years of work: recipes, decisions, links, client notes. Today, when you ask Claude for something, you have to copy-paste the context every time.

With the Notion connector, Claude Code reads your workspace directly (with your permission) and answers based on **your** knowledge. Ask *"what did we decide with client X last month?"* and it pulls the answer from the right doc.

Configured once, it follows you to every machine automatically thanks to Terminal Sync.

--- dev ---

Notion's official MCP server exposes databases, pages, and blocks as first-class tools to any MCP-aware client (Claude Code, Cursor, Aider).

Terminal Sync handles the part nobody wants to: syncing your `claude_desktop_config.json` between machines. Set up the Notion MCP once on your laptop — open Claude Code on your studio tower and your queries hit the same workspace without re-configuring.

The API token lives in the OS Keychain via `apiKeyHelper`, encrypted end-to-end in your Drive. Never on disk plaintext, never in the repo.

**Scope**: read databases, read/write pages, query children. Terminal Sync does not touch Notion data — only syncs the config.
