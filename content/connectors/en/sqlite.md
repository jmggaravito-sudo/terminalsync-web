---
name: SQLite
logo: /connectors/sqlite.svg
category: dev
status: available
simpleTitle: "Ask your local SQLite database in plain English"
simpleSubtitle: "\"List all tables\", \"how many rows in customers\" — without opening any IDE."
devTitle: "SQLite MCP Connector"
devSubtitle: "Local SQLite DB connector with full SQL execution."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite"
affiliate: false
tagline: "Quick local SQLite queries"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Ideal for local DBs: prototypes, exports, archives. You point at the file and ask your AI to read or modify it conversationally.

Allows writes — usable for building demo data, fixing rows, exporting reports.

--- dev ---

`@modelcontextprotocol/server-sqlite` takes a `--db-path` argument. Operations: `read_query`, `write_query`, `create_table`, `list_tables`, `describe_table`, `append_insight`. Includes a "business insights" memo capability.

License: MIT.
