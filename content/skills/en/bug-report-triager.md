---
name: Bug Report Triager
logo: /skills/bug-report-triager.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Bug triage in 30 seconds, not 30 minutes"
description: "Reads a bug report and returns severity, suggested owner, and minimal repro."
---

## When to use

- You get 20 bug reports a day via Linear/GitHub/Slack and they all look "urgent".
- The reporter dropped a screenshot but no repro steps.
- You need to decide fast what to fix today and what goes to backlog.

## What it does

From the report (text + screenshots + logs if you paste them):

- **Severity**: P0/P1/P2/P3 with explicit reasoning ("data loss" / "user blocker" / "cosmetic")
- **Probable owner**: which code area is touched (frontend auth, API billing, etc.) based on symptoms
- **Minimal repro steps**: if the reporter didn't include them, infers them from screenshots/logs
- **Cause hypotheses**: top 2-3 likely reasons, ranked
- **What to ask the reporter**: 1-2 things max if critical info is missing

Blocks: doesn't mark everything P1, doesn't suggest "investigate further" as an action. If it can't triage with the given info, it says so and asks for something concrete.

## How to use

1. Paste the full bug report (include the conversation if there's back-and-forth).
2. Add product context if useful: *"We're a B2B SaaS, P0 = affects billing"*.
3. Returns the card ready to paste into your issue tracker.

## Best for

Tech leads receiving support-routed bugs, founders without a QA team, devs in on-call rotation.
