---
name: GitHub
logo: /connectors/github.svg
category: dev
status: available
tagline: "Review the code in your repos — the connector brings the changes, the skill audits them."
description: "Bundles the GitHub connector (repos, PRs, issues, files) with Code Reviewer (reviews a diff or PR with findings ranked by severity and backed by evidence), so 'review this PR' is a single action."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: github
skillSlugs: ["code-reviewer"]
---
## When to use

- You want your AI to review a Pull Request or a change in your GitHub repos, without pasting the diff by hand.
- You want a review with findings ranked by severity and backed by evidence, not a generic "looks good".
- You work with Claude Code or Codex and want a second look before merging.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **GitHub (the connector)** accesses your repos, PRs, issues, and files.
- **Code Reviewer (the skill)** reviews the diff or PR and returns findings ranked by severity, with evidence and its limit (it reviews what it sees; it doesn't replace tests or a CI pipeline).

Together: *"review PR #42 in my repo"* → the connector brings the diff, the skill audits it.

## How to use

1. Install the Plugin and connect your GitHub account.
2. Ask: *"review the changes in PR #42 of my-org/my-repo"*.
3. You get prioritized findings with evidence, ready to act on before merging.

## Best for

Developers and technical teams who want an evidence-backed code review on their GitHub PRs. Requires connecting your GitHub account.
