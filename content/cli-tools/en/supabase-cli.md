---
name: Supabase CLI
binary: supabase
installCommand: brew install supabase/tap/supabase
authCommand: supabase login
vendor: Supabase
homepage: https://supabase.com/docs/guides/cli
repo: https://github.com/supabase/cli
category: database
tagline: Local dev, migrations and edge functions for your Supabase project.
description: Run a full local Supabase stack (Postgres + Auth + Storage + Studio), generate type-safe schemas, push migrations to production and ship edge functions — all without leaving the terminal. TerminalSync keeps the Supabase workflow and project context close to the terminal your AI is using.
status: available
---

## What it does

`supabase` is the official CLI for Supabase. It spins up a full local stack on Docker (Postgres + GoTrue + Storage + Studio + Realtime), generates TypeScript types from your live schema, manages migrations as plain SQL files in your repo, and deploys edge functions. It's the right tool for any non-trivial Supabase project.

## What TerminalSync adds

- **Project workflow.** Keep install, login, local stack and migration commands attached to the TerminalSync project, so a second Mac has the same runbook even if you still authenticate Supabase locally.
- **Memory across sessions.** Your AI remembers which Supabase project you're working on, the latest migration, and your auth/storage schema — so "add an RLS policy" lands in the right file.
- **MCP bridge.** Pair with the Supabase MCP connector to let your AI query your live database directly through the connector's own Supabase auth.

## Typical commands

```bash
supabase init
supabase start
supabase db push                    # apply migrations to remote
supabase gen types typescript --local
supabase functions deploy my-fn
```
