---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Let your AI read and write your database"
simpleSubtitle: "Supabase-managed Postgres — with read-only mode for critical production."
devTitle: "Supabase MCP Connector"
devSubtitle: "Official supabase-community server: SQL, migrations, edge functions, storage."
ctaUrl: "https://supabase.com"
tokenHelpUrl: "https://supabase.com/dashboard/account/tokens"
manifest:
  mcpServers:
    supabase:
      command: npx
      args: ["-y", "@supabase/mcp-server-supabase"]
      env:
        SUPABASE_ACCESS_TOKEN: "${SECRET:SUPABASE_ACCESS_TOKEN}"
affiliate: false
tagline: "Your Postgres, within reach of the agent"
originalAuthor: "Supabase community"
originalAuthorUrl: "https://github.com/supabase-community"
license: "Apache-2.0"
licenseUrl: "https://github.com/supabase-community/supabase-mcp/blob/main/LICENSE"
---
**Supabase** is the most popular open-source alternative to Firebase: managed Postgres, auth, storage, realtime, edge functions — all under one dashboard. The official connector exposes tools across 8 categories (Account, Database, Knowledge Base, Development, Edge Functions, Debugging, Branching, Storage), letting the agent read schemas, execute SQL, apply migrations, generate TypeScript types and deploy edge functions.

Ask *"how many users signed up last week?"* and it writes the SQL, runs it, returns the number. Ask *"create a new table for invitation tracking"* and it drafts the migration SQL — *"SQL passed to this tool will be tracked within the database, so LLMs should use this for DDL operations"*, per the official README.

### What you can ask

- *"List the tables in the `public` schema with their columns and types — I need to understand the structure before doing an analysis."*
- *"How many active users did we have in the last 30 days, grouped by country."*
- *"Generate the migration to add a `subscription_tier` column to the `users` table with default 'free'."*

### Read-only mode (recommended for production)

The server supports an officially documented **read-only mode**: *"all queries execute as a read-only Postgres user, disabling mutating tools entirely."* It's the safe way to let the agent analyze production without risk of accidental UPDATEs/DROPs.

To enable it, pass `--read-only` to the server or use a read-only Postgres role in your project. Ideal for dashboards, analysis and debugging; only enable write mode in development projects.

### What token you need

You need a Supabase **Personal Access Token (PAT)** — the server operates *"under the context of your developer permissions"* via this PAT. Different from the `service_role` or `anon` key of your project.

1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Click "Generate new token". Name it something like "Terminal Sync — Claude".
3. Copy it (you only see it once) and paste it when the Lab asks for `SUPABASE_ACCESS_TOKEN`. Encrypted in your Keychain.

The PAT's scope is your **Supabase account**: the agent can see every project where you're owner/member. For critical production, we recommend a separate Supabase project as an "agent sandbox", or a dedicated account.

--- dev ---

`@supabase/mcp-server-supabase` (supabase-community, official) exposes tools across 8 groups verified against the README: Account (`list_projects`, `create_project`, etc.), Database (`list_tables`, `execute_sql`, `apply_migration`), Knowledge Base (docs search), Development (TS type generation, API key retrieval), Edge Functions (deploy/manage), Debugging (logs, advisory notices), Branching (paid plans), Storage (buckets).

Auth: PAT via `SUPABASE_ACCESS_TOKEN`, account-scoped. `apply_migration` tracked in the DB so the LLM uses it for DDL. The `--read-only` flag executes all queries as a read-only Postgres role and disables mutating tools — always use it in prod.

Terminal Sync keeps the PAT in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines.

License: Apache-2.0. Source: github.com/supabase-community/supabase-mcp.
