---
name: Supabase
logo: /connectors/supabase.svg
category: database
status: available
simpleTitle: "Let your AI read and write your database"
simpleSubtitle: "Without giving it full access — only the tables you pick, with keys stored securely."
devTitle: "Supabase MCP Connector"
devSubtitle: "Expose Postgres schemas + RLS-scoped queries to Claude Code."
ctaUrl: "https://supabase.com/partners/REPLACE_WITH_JUANS_SUPABASE_AFFILIATE"
affiliate: true
tagline: "Your Postgres, within reach of the agent"
---

If your app stores data in Supabase, you can now ask Claude things like *"how many users signed up last week?"* or *"export March orders to CSV"* — and it generates the query, runs it, and gives you the answer.

With granular permissions: you pick which tables the agent sees, what operations it can perform (read-only vs write). You never hand over the full `service_role` unless you want to.

Terminal Sync keeps the config encrypted and synced across your machines — no credential files flying around.

--- dev ---

Supabase's MCP server wraps the REST/PostgREST API with RLS-aware tool definitions. Claude Code gets schema introspection + parameterized queries without ever seeing the service_role key — it uses a scoped anon/auth token you provision.

Terminal Sync keeps your `claude_desktop_config.json` in sync across machines. The connector URL + anon key live in your `~/.claude` folder, which Terminal Sync encrypts with AES-256-GCM before pushing to Drive. The service_role stays in your OS Keychain via `apiKeyHelper` — never plaintext on disk.

**Best for**: analytics queries, admin dashboards, AI agents that need to read-own-write-approved data. Not for: giving the model unscoped write access to production.
