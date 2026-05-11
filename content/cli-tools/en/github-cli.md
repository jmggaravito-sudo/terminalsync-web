---
name: GitHub CLI
binary: gh
installCommand: brew install gh
authCommand: gh auth login
vendor: GitHub
homepage: https://cli.github.com
repo: https://github.com/cli/cli
category: dev
tagline: Issues, PRs, releases and gh actions — straight from your shell.
description: GitHub's official CLI. Read and create issues, open PRs, run workflows, manage releases, all without leaving the terminal. TerminalSync auto-syncs your `gh` auth across every machine so a fresh Mac is logged in the second you mount the session.
status: available
---

## What it does

`gh` is GitHub's official command line wrapper around the v3 REST and GraphQL APIs. Once authenticated it lets you create and review pull requests, file and triage issues, kick off Actions runs, manage releases and gists, and clone or fork repos — all without context-switching to the browser.

## What TerminalSync adds

- **Auth Sync.** `~/.config/gh/hosts.yml` is encrypted and synced across every TerminalSync machine. Sign in once on your MacBook, open the same session on the Mac mini, `gh pr list` works immediately.
- **Session memory.** Your AI agent remembers which repo you're working in and which PRs are open — so when you say "review my open PR" it knows what you mean.
- **MCP bridge.** Pair it with the GitHub MCP connector and Claude / Codex / Gemini can read commit history or open PRs through the same auth context.

## Typical commands

```bash
gh pr create --fill
gh issue list --assignee @me --state open
gh release create v1.2.0 --generate-notes
gh workflow run deploy.yml --ref main
gh repo clone myorg/myrepo
```
