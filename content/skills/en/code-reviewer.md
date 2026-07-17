---
name: Code Reviewer
logo: /skills/code-reviewer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Honest review before you merge"
description: "Reviews real diffs for bugs, security issues, performance risks, missing tests, and merge-blocking edge cases before you ship."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You said "review this PR", "what's missing in this diff", or "I want a critical second pair of eyes before merging".
- You have a real diff, file, or PR URL and want the risks called out before CI or a teammate catches them.
- The change touches authentication, payments, data writes, concurrency, migrations, permissions, or other code where a shallow review is expensive.

## What it does

Reads the diff and returns:

- **Real bugs**: off-by-one errors, race conditions, missing error handling, leaks, stale state, and broken data contracts.
- **Security and privacy risks**: unsafe auth checks, secret exposure, missing authorization, injection paths, or over-broad permissions.
- **Architectural risks**: changes that touch critical flows without tests, migrations, rollback plans, or compatibility notes.
- **Forgotten edge cases**: empty states, retries, partial failures, time zones, duplicate events, idempotency, and backwards compatibility.
- **Verdict**: ship / fix-first / no-ship with concrete reasoning and the smallest useful fix.

It avoids lint-only feedback, vague "consider adding comments" advice, and broad rewrites unless the diff shows a real product risk.

## How to use

1. Paste the diff (`git diff main...HEAD`), a file excerpt, or the PR URL.
2. Add the risk context if it matters: *"this handles payments; watch concurrency and idempotency"*.
3. Say whether you want a blocker-only review or a full pass.
4. Read the output; key items are marked 🔴 blocker, 🟡 review, or 🟢 OK, with file/line references when the diff provides them.

## Best for

Solo devs without a review team, juniors who want to simulate senior review, teams that already have CI for formatting and tests but need a sharper human-style risk pass before merging.
