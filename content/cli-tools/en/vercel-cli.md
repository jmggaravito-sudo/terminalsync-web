---
name: Vercel CLI
binary: vercel
installCommand: npm i -g vercel
authCommand: vercel login
vendor: Vercel
homepage: https://vercel.com/docs/cli
repo: https://github.com/vercel/vercel
category: deploy
tagline: Deploy, env vars, preview URLs and team scopes from one command.
description: Vercel's official CLI. Deploy any commit to a preview URL, manage environment variables per environment, link projects, inspect logs and promote to production — all scriptable. TerminalSync syncs your Vercel auth so a fresh machine deploys without re-login.
status: available
---

## What it does

`vercel` is the entry point to the Vercel platform from the terminal. Deploy a folder to a preview URL, pull or push environment variables, link a project, tail function logs, promote a deployment to production, run `vercel build --prebuilt` in CI — all from one binary. Works equally well for personal hobby projects and team accounts.

## What TerminalSync adds

- **Auth Sync.** `~/.local/share/com.vercel.cli/auth.json` is encrypted and replicated across your machines. No more "I have to login to Vercel again on this Mac".
- **Env vault.** When you `vercel env pull` into a TerminalSync folder, the resulting `.env.local` is auto-encrypted at rest. Your secrets follow the folder, never leak into Drive plain.
- **Session memory.** Your AI remembers which Vercel project + environment you're targeting, so "redeploy preview" doesn't need clarification.

## Typical commands

```bash
vercel                          # deploy current dir as preview
vercel --prod                   # promote to production
vercel env pull .env.local
vercel env add MY_SECRET production
vercel inspect <url>
vercel logs <url>
```
