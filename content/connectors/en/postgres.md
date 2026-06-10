---
name: PostgreSQL
logo: /connectors/postgres.svg
category: dev
status: available
simpleTitle: "Talk to your Postgres database in plain English"
simpleSubtitle: "\"How many active customers in October?\", \"top 10 orders by amount\" — without writing SQL."
devTitle: "Postgres MCP Connector"
devSubtitle: "Read-only DB connection via PG_URL. Schema introspection + query execution."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres"
affiliate: false
tagline: "Postgres queries from your AI"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
You give it the connection URL. It introspects the schema, lists tables, runs `SELECT` queries you ask in plain language. By default read-only — peace of mind.

Useful for ad-hoc analysis, support, and exploring your data without opening a UI tool.

--- dev ---

`@modelcontextprotocol/server-postgres` requires `PG_URL` (or args). Operations: `query` (SQL SELECT only). Schema introspection via resource URI `postgres://schema/<table>`. For writes use a dedicated connector or a controlled API — this one is intentionally read-only.

License: MIT.
