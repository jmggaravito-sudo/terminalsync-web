---
name: Vercel CLI
logo: https://github.com/vercel.png?size=128
binary: vercel
installCommand: npm i -g vercel
authCommand: vercel login
vendor: Vercel
homepage: https://vercel.com/docs/cli
repo: https://github.com/vercel/vercel
category: deploy
tagline: Deploy, env vars, preview URLs and team scopes from one command.
description: Vercel's official CLI. Deploy any commit to a preview URL, manage environment variables per environment, link projects, inspect logs and promote to production — all scriptable. TerminalSync keeps deploy commands and encrypted project env files with the terminal.
status: available
---

## What it does

`vercel` is the entry point to the Vercel platform from the terminal. Deploy a folder to a preview URL, pull or push environment variables, link a project, tail function logs, promote a deployment to production, run `vercel build --prebuilt` in CI — all from one binary. Works equally well for personal hobby projects and team accounts.

## What TerminalSync adds

- **Deploy runbook.** Install, login, preview and production deploy commands stay attached to the project terminal.
- **Env vault.** When you `vercel env pull` into a TerminalSync folder, the resulting `.env.local` can be encrypted into the folder vault. Your secrets follow the folder without leaking into Drive in plaintext.
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
