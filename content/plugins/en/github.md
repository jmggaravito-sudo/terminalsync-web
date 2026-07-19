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
- You want a review with findings ranked by severity and backed by evidence — not a generic "looks good".
- You work with Claude Code or Codex and want a second look before merging.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **GitHub (the connector)** accesses your repos, PRs, issues, and files — so the skill can read the full diff and the files around the change, not just the snippet.
- **Code Reviewer (the skill)** reviews the diff or PR and returns findings ranked by severity, with evidence and its limit (it reviews what it sees; it doesn't replace tests or a CI pipeline).

**A real example:** a contributor opened PR #42 and you're unsure about merging it. You say *"review PR #42 in my-org/my-repo"*. GitHub brings the diff and the files it touches, Code Reviewer spots a missing error handler on a new route, a potential race condition, and two minor style issues, each with the exact line and why it matters. You know what to ask them to fix before merging — without reading the 300 lines by hand.

## How to use

1. Install the Plugin and connect your GitHub account.
2. Ask: *"review the changes in PR #42 of my-org/my-repo"*.
3. You get prioritized findings with evidence, ready to act on before merging.

## Why the bundle works

The review skill alone needs you to paste the code; give it little context and it reviews little. The connector alone brings you the code, but doesn't evaluate it. Together: the connector gives the skill the full diff and neighboring files, and the skill audits it with judgment — a review with real context, in one action.

## Limits

- It reviews what it sees in the diff and the files it can read — it doesn't replace tests, CI, or the final judgment of whoever merges.
- It doesn't guarantee there are no bugs; it's an evidence-backed second look, not a proof of correctness.
- Requires connecting your GitHub account; it only sees the repos that access allows.
