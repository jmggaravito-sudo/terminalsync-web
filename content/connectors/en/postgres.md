---
name: PostgreSQL
logo: /connectors/postgres.svg
category: database
status: available
simpleTitle: "Let your AI query Postgres safely"
simpleSubtitle: "Schema introspection and read-only queries for analysis without hand-writing SQL."
devTitle: "Postgres MCP Connector"
devSubtitle: "Official @modelcontextprotocol server: schema resources + query tool in a READ ONLY transaction."
ctaUrl: "https://www.postgresql.org"
manifest:
  mcpServers:
    postgres:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-postgres", "${SECRET:POSTGRES_URL}"]
affiliate: false
tagline: "Read-only Postgres queries from your AI"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**PostgreSQL** is the open-source relational database that powers critical data for thousands of products. The official MCP server provides *"read-only access to PostgreSQL databases"* so Claude can inspect schemas and run read queries without opening a separate SQL tool.

What it does: it exposes a `query` tool to execute read-only SQL against the connected database and schema resources for each table. The official README states that *"All queries are executed within a READ ONLY transaction"*, making it useful for analysis, support, debugging and data exploration.

### What you can ask

- *"List the tables available in this database and explain the likely relationships."*
- *"Run a SELECT that counts active customers by plan for the last 30 days."*
- *"Inspect the schema for the `orders` table and suggest the safest query for revenue by month."*

### What connection you need

You need a **Postgres connection URL** for a specific database, for example `postgresql://user:password@host:5432/db`. The official README shows the connection argument in `args` and says: *"Replace `/mydb` with your database name."*

1. Create a dedicated Postgres user for Terminal Sync.
2. Give it the minimum read permissions for the tables it needs.
3. Paste the connection URL when the Lab asks for `POSTGRES_URL`. Terminal Sync stores it encrypted in your Keychain.

Even though the server executes queries in a READ ONLY transaction, we also recommend using a read-only database role for defense in depth.

--- dev ---

`@modelcontextprotocol/server-postgres` is an official package published by `Anthropic, PBC` under the `@modelcontextprotocol` scope. Verified manifest: `npx -y @modelcontextprotocol/server-postgres ${SECRET:POSTGRES_URL}`; the official README documents the connection URL as the server's positional argument.

Components verified against the official README: `query` tool with `sql` input to execute read-only queries; `postgres://<host>/<table>/schema` resources with JSON schema for each table, including column names and data types, automatically discovered from database metadata.

Gotcha: `--help` is not implemented as a help flag; the binary expects a valid URL argument. The startup gate was validated with a syntactically valid Postgres URL and no real credentials.

Terminal Sync keeps the URL in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-postgres` on npm.
