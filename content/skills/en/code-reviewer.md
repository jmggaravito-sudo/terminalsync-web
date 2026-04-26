---
name: Code Reviewer
logo: /skills/code-reviewer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Honest review before you merge"
description: "Reviews diffs like a tired-but-fair senior: real bugs, not lint."
---

## When to use

- You said "review this PR", "what's missing in this diff", "I want a critical second pair of eyes before merging".
- You're about to merge and want a last pass before CI.

## What it does

Reads the diff and returns:

- **Real bugs** (not style): off-by-one, race conditions, missing error handling, leaks.
- **Architectural risks**: changes that touch something critical without tests.
- **Forgotten edge cases**: the typical list a senior would catch.
- **Verdict**: ship / fix-first / no-ship with concrete reasoning.

No lint, no "consider using TypeScript", no "add more comments". Straight to the point.

## How to use

1. Paste the diff (`git diff main...HEAD`) or pass the PR URL.
2. If you want context, add: *"this code handles payments, watch for concurrency."*
3. Read the output; key items are marked 🔴 (blocker), 🟡 (review), 🟢 (ok).

## Best for

Solo devs without a review team, juniors who want to simulate senior review, teams that have CI for lint but no human reviewer on call.
