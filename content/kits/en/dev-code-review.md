---
name: Code Review & Triage Kit
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Review pull requests with repo context and production error signal, straight from the terminal."
description: "A coherent engineering workflow bundle for developers and small teams who review code, triage issues, and tie changes back to production errors without rebuilding the stack for every repo."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: code-reviewer
    reason: "Gives Claude a repeatable, structured review workflow — correctness, edge cases, and prioritized findings — instead of ad-hoc 'looks fine'."
  - kind: connector
    slug: github
    reason: "Pulls the PR diff, files, issues, and repo context the review reasons over, so findings reference real code, not guesses."
  - kind: connector
    slug: sentry
    reason: "Brings production error and stack-trace context so the reviewer can prioritize the changes that touch code paths already failing in prod."
  - kind: cli
    slug: github-cli
    reason: "Lets the developer inspect PRs, issues, and Actions runs from the terminal and act on the review without switching to the browser."
---
## Who it is for

Developers and small engineering teams who spend real time reviewing pull requests, triaging issues, and connecting proposed changes to what is actually breaking in production.

Use it when one person or a small team wants a consistent review pass across many repos without wiring up the same tools each time.

## What it helps you do

This kit turns code review into a repeatable workflow:

- Pull a pull request's diff, changed files, and surrounding repo context with GitHub.
- Run a structured review with prioritized findings, edge cases, and risk notes via Code Reviewer.
- Cross-reference production errors and stack traces from Sentry to focus on the risky code paths.
- Inspect issues, PRs, and CI runs from the terminal with the GitHub CLI.

The expected outcome is a review that references real code and real failures, with prioritized, actionable findings — not a generic checklist.

## What's included

### Skills

- **Code Reviewer** — a structured review workflow that produces prioritized findings with reasoning. It is the core of the kit: it defines *how* the review happens.

### Connectors

- **GitHub** — reads PR diffs, files, issues, and repo context so the review reasons over the actual change.
- **Sentry** — reads production errors and stack traces so the review can prioritize changes touching code paths already failing.

### CLI

- **GitHub CLI (`gh`)** — inspects PRs, issues, and Actions runs and acts on them from the terminal. Included because the target user is a developer who works in the shell; the review-to-action loop stays in one place.

## How to use it

1. Install the kit, authenticate GitHub, connect Sentry with its token, and run `gh auth login`.
2. Point Code Reviewer at a pull request: ask it to review the diff for correctness, edge cases, and risk.
3. Ask it to cross-check the changed files against recent Sentry errors and flag any change touching a failing code path.
4. Ask for a prioritized findings list (blockers → nits) with file references.
5. Use `gh` to comment, request changes, or check the CI run without leaving the terminal.

## Why these pieces belong together

The kit is useful because the steps feed each other:

- GitHub gives the review its subject — the actual diff and repo context.
- Code Reviewer gives it a method — structured, prioritized findings instead of vibes.
- Sentry gives it stakes — which of these changes touches something already breaking in production.

Installed separately, the reviewer has to remember to correlate production errors with the diff by hand. Installed together, the kit gives a coherent path: **read the change → review it with method → weight it by real production risk → act from the terminal**.

## Limits

- It does not merge, deploy, or approve pull requests on your behalf; a human makes the call.
- It reviews the evidence it can read; private submodules, secrets, and unlinked services are out of scope.
- GitHub and Sentry require their own tokens and are subject to those accounts' permissions and plan limits.
- Sentry context only helps when the project actually reports errors to Sentry; without it, the kit still reviews but loses the production-risk weighting.
- It is not a security audit or a substitute for tests and CI — use it alongside them, not instead of them.
