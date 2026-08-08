---
name: Code Reviewer
logo: /skills/code-reviewer.svg
category: dev
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Honest review before you merge"
description: "Reviews real diffs for bugs, security issues, performance risks, missing tests, and merge-blocking edge cases before you ship."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You said "review this PR", "what's missing in this diff", or "I want a critical second pair of eyes before merging".
- You have a real diff, file, or PR URL and want the risks called out before CI or a teammate catches them.
- The change touches authentication, payments, data writes, concurrency, migrations, permissions, or other code where a shallow review is expensive.

**Ask only when something is missing that BLOCKS the task.** If it can be done
with what you were given, do it. Stopping to ask for precision when the task is
already doable is not caution — it is not delivering. And scoring "how usable
your data is" on a perfectly solvable task misleads more than it helps.

When something really is missing, do both: deliver what the available input
supports, and say what you need for the rest. Never the question alone.

## What it does

Reads the diff and returns:

- **Real bugs**: off-by-one errors, race conditions, missing error handling, leaks, stale state, and broken data contracts.
- **Security and privacy risks**: unsafe auth checks, secret exposure, missing authorization, injection paths, or over-broad permissions.
- **Architectural risks**: changes that touch critical flows without tests, migrations, rollback plans, or compatibility notes.
- **Forgotten edge cases**: empty states, retries, partial failures, time zones, duplicate events, idempotency, and backwards compatibility.
- **Verdict**: ship / fix-first / no-ship with concrete reasoning and the smallest useful fix.

It avoids lint-only feedback, vague "consider adding comments" advice, and broad rewrites unless the diff shows a real product risk.

**Two things reviewers forget, so check them every time:**

- **Cleanup.** An effect, subscription, listener, interval or watcher that is
  registered but never torn down leaks and fires on unmounted components. If the
  diff adds one and returns nothing, say so — it is a real bug, not a nitpick.
- **When there is no diff**, do not just ask for it. Say what you will check
  once it arrives — the specific risks for that kind of change — so the wait is
  useful instead of dead time.

## How to use

1. Paste the diff (`git diff main...HEAD`), a file excerpt, or the PR URL.
2. Add the risk context if it matters: *"this handles payments; watch concurrency and idempotency"*.
3. Say whether you want a blocker-only review or a full pass.
4. Read the output; key items are marked 🔴 blocker, 🟡 review, or 🟢 OK, with file/line references when the diff provides them.

## Best for

Solo devs without a review team, juniors who want to simulate senior review, teams that already have CI for formatting and tests but need a sharper human-style risk pass before merging.
