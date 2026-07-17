---
name: Neon
logo: /connectors/neon.svg
category: dev
status: available
simpleTitle: "Ask — and act on — your Neon Postgres in plain language"
simpleSubtitle: "Official Neon server: manage projects, branches, and run SQL."
devTitle: "Neon MCP Connector"
devSubtitle: "Official @neondatabase/mcp-server-neon: tools over the Neon API, API-key scoped."
ctaUrl: "https://neon.tech"
tokenHelpUrl: "https://neon.tech/docs/manage/api-keys"
manifest:
  mcpServers:
    neon:
      command: npx
      args: ["-y", "@neondatabase/mcp-server-neon", "start", "${SECRET:NEON_API_KEY}"]
affiliate: false
tagline: "Your Postgres, within reach of the agent"
originalAuthor: "Neon"
originalAuthorUrl: "https://github.com/neondatabase/mcp-server-neon"
license: "MIT"
licenseUrl: "https://github.com/neondatabase/mcp-server-neon/blob/main/LICENSE"
---
**Neon** is serverless Postgres — databases with branching, so you can spin up a copy of your data the way you branch code. The official connector, published by Neon, is *"an open-source tool that lets you interact with your Neon Postgres databases in natural language."* It acts as a bridge between what you ask and the [Neon API](https://api-docs.neon.tech/reference/getting-started-with-neon-api), translating your requests into the calls needed to create projects and branches, run queries, and perform database migrations.

Ask *"give me a summary of all my Neon projects and what data is in each one"* and it reads your account and answers. Say *"create a database called my-database with a users table"* and it sets it up — no SQL, no clicking through the console. It talks to Neon with your API key, so it can do anything you can do from your own account.

### What you can ask

- *"Let's create a new Postgres database, and call it 'my-database'. Then create a table called users with the columns: id, name, email, and password."*
- *"I want to run a migration on my project 'my-project' that alters the users table to add a new column called 'created_at'."*
- *"Can you give me a summary of all of my Neon projects and what data is in each one?"*

### What token you need

You need a **Neon API key** — the key that lets software act on your Neon account.

1. Sign in at [console.neon.tech](https://console.neon.tech/signup) and open your account settings.
2. Follow the [Neon API Keys guide](https://neon.tech/docs/manage/api-keys) to generate a new key, then copy it.
3. Paste it when the Lab asks for `NEON_API_KEY`. It's stored encrypted in your Keychain.

The API key can create, change, and delete real projects and data, so treat it like a password. **A word of caution, straight from Neon:** this local server is *intended for local development and IDE integrations only* — Neon **does not recommend using it in production**, because it can execute powerful operations that may lead to accidental or unauthorized changes. Always review and authorize what the agent proposes before it runs.

--- dev ---

`@neondatabase/mcp-server-neon` (Neon, official — repo `neondatabase/mcp-server-neon`) is the **Local MCP Server**, run via `npx -y @neondatabase/mcp-server-neon start <NEON_API_KEY>`. Auth is a Neon API key passed as the final positional argument (`start <key>`); the manifest here injects it from Keychain as `${SECRET:NEON_API_KEY}`. Requires Node.js >= v18.

Tools exposed to the client (verbatim from the README):

- **Project management:** `list_projects`, `list_shared_projects`, `describe_project`, `create_project`, `delete_project`
- **Branch management:** `create_branch`, `delete_branch`, `describe_branch`, `list_branch_computes`, `list_organizations`, `reset_from_parent`
- **SQL query execution:** `get_connection_string`, `run_sql`, `run_sql_transaction`, `get_database_tables`, `describe_table_schema`, `list_slow_queries`
- **Database migrations (schema changes):** `prepare_database_migration`, `complete_database_migration`
- **Query performance tuning:** `explain_sql_statement`, `prepare_query_tuning`, `complete_query_tuning`
- **Neon Auth:** `provision_neon_auth`

Migrations run safely via the split `prepare_database_migration` ("Start") / `complete_database_migration` ("Commit") commands — the "Start" command applies the migration to a temporary branch so the LLM can test it before committing to the original branch.

**Security, in Neon's own words:** *"The Neon MCP Server is intended for local development and IDE integrations only. We do not recommend using the Neon MCP Server in production environments. It can execute powerful operations that may lead to accidental or unauthorized changes."* Always review and authorize actions requested by the LLM before execution.

**Alternative — Remote MCP Server (Preview):** instead of the local API-key setup, Neon offers a managed remote server that authenticates via OAuth (`npx -y mcp-remote https://mcp.neon.tech/mcp`), which eliminates managing API keys and ships the latest features automatically. It also supports API-key auth via an `Authorization: Bearer` header.

Terminal Sync keeps the API key in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: MIT. Source: github.com/neondatabase/mcp-server-neon.
