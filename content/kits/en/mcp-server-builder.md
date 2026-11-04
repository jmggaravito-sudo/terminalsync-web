---
name: MCP Server Builder Kit
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Design, build, and ship the connector your stack doesn't have yet — current SDK docs at hand, work landing in a repo."
description: "A coherent dev bundle for the developer extending TerminalSync with a custom MCP server: scope the tool surface with MCP Builder, pull current version-specific SDK docs from Context7 while coding, and run the repo loop (scaffold, test, commit, PR) from the terminal with GitHub CLI."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: mcp-builder
    reason: "The process of the job: scope design (minimum tool set, schemas, pagination, read/write boundaries), implementation structure, a safety review (auth model, least privilege, destructive-action confirmation), and a test plan — so the server gets hardened instead of merely generated."
  - kind: connector
    slug: context7
    reason: "Keeps the build on current ground: resolves the library ID and pulls version-specific docs and real code examples for the MCP SDKs and client libraries in play, so the server targets the API that exists today instead of the one in the model's training snapshot."
  - kind: cli
    slug: github-cli
    reason: "Where the work lands: scaffold and run the server locally, then drive gh to create the repo, commit, open the PR, and read the CI result from the same terminal the server is being tested in — no context switch to a browser mid-build."
---
## Who it is for

A developer who extends this stack rather than just consuming it: someone wrapping an internal tool, a vendor API, or a database into an MCP server so an agent client can use it — and who wants a build path that ends in a reviewed PR, not a vibe-generated file.

It is the kit for the gap in the catalog: the product you need connected that no published connector covers yet.

## What it helps you do

- **Scope it**: decide the minimum tool set — which jobs the server serves, what schemas, what stays read-only, which writes need confirmation — before any code exists.
- **Build it on the real API**: pull current, version-specific docs and examples for the SDK you're targeting while you write the code, instead of shipping against a hallucinated function.
- **Harden it**: run the safety pass — auth boundaries, input validation, rate limits, retries, idempotency, destructive-action gates — and the test plan for happy paths, invalid arguments, auth failure, and pagination.
- **Ship it**: scaffold, run and test locally, commit, open the PR, and watch CI from the same terminal — the server lands where review happens.

The expected outcome: a working, tested MCP server in a repo with a PR someone can review — and an honest test report attached to it.

## What's included

### Skills

- **MCP Builder** — the process. Guides the whole build: scope design, implementation structure for TypeScript or Python, safety review, and the test plan, with an explicit refusal to call anything production-ready before tests, security review, and runbook evidence exist.

### Connectors

- **Context7** — current docs, straight into the prompt. Resolves the library and returns up-to-date, version-specific documentation and real code examples. Keyless by default (an optional API key buys rate limits and private repos).

### CLI tools

- **GitHub CLI** — the delivery path. Creates and manages the repo, commits, opens the PR, checks CI status, and replies to review — terminal-level execution, because the build itself (npm init, running the server, the inspector) already lives there.

## How to use it

1. Install the kit and authenticate once: `gh auth login` for the repo work. Context7 needs no key.
2. Scope first, with MCP Builder: *"I want to expose our invoicing API as an MCP server — help me pick the minimum tool set and what stays read-only."*
3. Build with docs in the loop: *"Resolve the MCP TypeScript SDK on Context7 and pull its docs for tool definitions"* — then write the server against what comes back.
4. Harden and test: run the safety-review and test-plan passes from MCP Builder — including the destructive-action confirmation and auth-failure cases.
5. Ship it: scaffold the repo, commit, `gh pr create`, and check CI without leaving the terminal. The PR is where a second pair of eyes earns the "production-ready" label.

## Why these pieces belong together

The kit follows the real loop of building an integration, not a pile of dev tools:

- MCP Builder is **the process** — without it you get a plausible file, not a hardened server; the skill exists precisely to keep scope, safety, and tests in the loop.
- Context7 is **the ground truth** — MCP SDKs move fast and models answer from stale snapshots; the kit's code is only as good as the docs it was written against.
- GitHub CLI is **where the work becomes reviewable** — a server that lives only in a chat window can't be tested, reviewed, or merged; the repo and PR are the deliverable.

Installed separately, the docs are stale, the process is vibes, and the artifact evaporates with the chat. Installed together: **scope → build on current docs → harden → land a reviewable PR.**

It shares the dev category with Dev Code Review and Ship Supabase App, but the job is different: those review existing code and ship an app on Supabase. This kit creates the missing connector itself — it is the kit for extending the catalog, and its output is the server the connector loops would later evaluate.

## Limits

- **It builds; it doesn't bless.** MCP Builder refuses to call a server production-ready without tests, security review, and runbook evidence — that judgment stays with human review. Publishing a connector into the TerminalSync catalog goes through the connector loop's gates and review, not this kit.
- **The vendor API is on you**: the kit helps you write the server wrapping an API; credentials, quotas, and the API's terms of service are yours to arrange, and the safety pass will check how you handle secrets, not obtain them.
- **Context7 covers documented, public libraries** — internal or private APIs aren't in it; for those, your own docs are the source and Context7 has nothing to pull.
- **It assumes a terminal.** This is a builder kit for developers; if you want a connector installed rather than built, install one from the catalog instead — that is what it's for.
- **gh requires auth and repo access**; CI results are only as visible as your permissions on the repo.
