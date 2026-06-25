---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Let your AI read and write your database"
simpleSubtitle: "Without giving it full access — only the tables you pick, with keys stored securely."
devTitle: "Supabase MCP Connector"
devSubtitle: "Expose Postgres schemas + RLS-scoped queries to Claude Code."
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
**Supabase** is the most popular open-source alternative to Firebase: managed Postgres, auth, storage, realtime, edge functions — all under one dashboard. If your app stores data there, this connector gives your AI secure, scoped access to that Postgres without you opening the dashboard.

Ask *"how many users signed up last week?"* and it writes the SQL, runs it, and returns the number. Ask *"export March orders to CSV"* and it builds the dump. Ask *"create a new table for invitation tracking"* and it drafts the migration SQL for you to apply.

### What you can ask

- *"List the tables in the `public` schema with their columns and types — I need to understand the structure before doing an analysis."*
- *"How many active users did we have in the last 30 days, grouped by country."*
- *"Generate the migration to add a `subscription_tier` column to the `users` table with default 'free'."*

### What token you need

You need a Supabase **Personal Access Token (PAT)** — different from the `service_role` or `anon` key of your project. The PAT identifies you as owner/collaborator and lets the agent list projects, read schemas, run queries.

1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Click "Generate new token". Name it something like "Terminal Sync — Claude".
3. Copy it (you only see it once) and paste it when the Lab asks for `SUPABASE_ACCESS_TOKEN`. Encrypted in your Keychain, never plaintext on disk.

The PAT's scope is your **Supabase account**: the agent can see every project where you're owner/member. If you want tighter scope (one project, read-only), pass the agent explicit instructions — there's no granular scope in the PAT itself yet.

For critical production, we recommend a separate Supabase project as an "agent sandbox", or a dedicated account.

--- dev ---

`@supabase/mcp-server-supabase` wraps the Management API + SQL execution. Key tools: `list_projects`, `list_tables`, `execute_sql`, `apply_migration`, `get_logs`. The PAT is account-scoped — it's not the service_role.

For RLS-aware queries, the server executes as the `postgres` role (bypasses RLS by default). If you need to impersonate a specific user, use `set role` within the SQL or wait for finer-grained PAT scoping when Supabase ships it.

Terminal Sync keeps the PAT in Keychain via `apiKeyHelper`, synced encrypted with AES-256-GCM across machines. The project URL and anon key (if you need them separately) live in `~/.claude/claude_desktop_config.json`, also encrypted in transit.

License: Apache-2.0. Source: github.com/supabase-community/supabase-mcp.
