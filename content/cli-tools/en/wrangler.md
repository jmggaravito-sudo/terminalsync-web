---
name: Wrangler
binary: wrangler
installCommand: npm i -g wrangler
authCommand: wrangler login
vendor: Cloudflare
homepage: https://developers.cloudflare.com/workers/wrangler/
repo: https://github.com/cloudflare/workers-sdk
category: deploy
tagline: Build, preview and deploy Cloudflare Workers, Pages and D1 from one CLI.
description: Cloudflare's official CLI for the Workers platform — Workers, Pages, D1 (SQLite), R2 (object storage), KV, Queues, Durable Objects. Develop locally, tail production logs, manage secrets, deploy with one command. TerminalSync keeps the Workers runbook and project env files with your synced terminal.
status: available
---

## What it does

`wrangler` is the entry point to Cloudflare's entire Workers platform. Develop locally with Miniflare, deploy Workers globally in seconds, manage D1 databases, R2 buckets, KV namespaces, Queues and Durable Objects, tail live logs, set encrypted secrets — all from one binary. It's the official path for shipping anything on Cloudflare's edge.

## What TerminalSync adds

- **Workers runbook.** Install, login, local dev, deploy, tail and D1 commands stay attached to the project terminal.
- **Secrets in env vault.** Keep recoverable app secrets in a project `.env` file and TerminalSync can encrypt that file into the folder vault. Cloudflare-bound secrets still live in Cloudflare after `wrangler secret put`.
- **Session memory.** Your AI remembers which Worker project, account and environment you're targeting — so "deploy this to staging" doesn't ask for confirmation it already has.

## Typical commands

```bash
wrangler dev                       # local dev server (Miniflare)
wrangler deploy                    # ship to global edge
wrangler secret put STRIPE_KEY
wrangler tail                      # live logs from production
wrangler d1 execute my-db --command "SELECT * FROM users"
```
