---
name: Standup Notes
logo: /skills/standup-notes.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Your standup in 30 seconds instead of 30 minutes"
description: "Turns the last 24h of Slack/Linear/GitHub into a clean standup: yesterday, today, blockers."
---

## When to use

- It's 8:55 and you forgot to prep the 9am standup.
- You're a lead and need to summarize team activity without opening 4 tools.
- You're posting an async update and want something digestible for non-devs.

## What it does

From your activity (commits, PRs, Linear/GitHub comments, Slack messages if you paste them):

- **Yesterday**: what you actually closed (not what you touched — only what moved to done)
- **Today**: the logical next, based on what's in-progress
- **Blockers**: explicit ones in threads + implicit ones (PR waiting on review for 3 days)

Short bullet output, no filler. Built to send to Slack, not to impress a VP.

## How to use

1. Paste the activity logs or wire it up via connector (GitHub + Linear + Slack if you have the trio).
2. Tell it the format: *"For Slack #standup, 5 bullets max"*.
3. Returns the draft ready to send.

## Best for

Tech leads on remote teams, founders running 3 different standups a day, devs who hate writing status updates but know they matter.
