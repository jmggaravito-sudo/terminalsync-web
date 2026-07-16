---
name: Ship a Supabase App Kit
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Build, review, migrate, and deploy a Supabase + Vercel app without leaving the terminal."
description: "A coherent shipping workflow for solo developers and small teams building on Supabase and Vercel: read and operate the backend, review the diff, run migrations, and deploy — end to end, from one place."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: supabase
    reason: "Reads the schema and data and operates the backend the app runs on, so the AI reasons over the real database instead of guessing at its shape."
  - kind: connector
    slug: github
    reason: "Pulls the repository, diff, and files the change lives in, so review and shipping reference actual code."
  - kind: skill
    slug: code-reviewer
    reason: "Runs a structured review of the diff before it ships — correctness, edge cases, and risk — so a deploy isn't the first time anyone reads the change."
  - kind: cli
    slug: supabase-cli
    reason: "Links the project and runs database migrations and local dev from the terminal — the step that actually changes the backend."
  - kind: cli
    slug: vercel-cli
    reason: "Deploys the frontend and inspects deployments from the terminal, closing the build-to-live loop without a browser detour."
---
## Who it is for

Solo developers and small teams building a web app on Supabase and Vercel who want to go from a change to a live deploy without wiring the same tools together for every project.

Use it when the same person writes the code, owns the database, and ships — and wants the review-and-deploy path to stay in one place.

## What it helps you do

This kit turns "I built a feature" into "it's reviewed, migrated, and live":

- Read the schema and data and operate the backend with Supabase.
- Pull the repo and diff with GitHub.
- Review the change with a structured pass before it ships via Code Reviewer.
- Run database migrations and local dev with the Supabase CLI.
- Deploy the frontend and check the deployment with the Vercel CLI.

The expected outcome is a reviewed change that reaches production with its migration applied — not a deploy that is the first time the diff was read.

## What's included

### Connectors

- **Supabase** — reads schema and data and operates the backend the app depends on.
- **GitHub** — reads the repository, diff, and files the change lives in.

### Skills

- **Code Reviewer** — a structured review workflow that flags correctness, edge cases, and risk before the change ships.

### CLI

- **Supabase CLI** — links the project and runs migrations and local dev from the terminal.
- **Vercel CLI** — deploys the frontend and inspects deployments from the terminal.

## How to use it

1. Install the kit, connect Supabase with its access token, authenticate GitHub, and run `supabase login` and `vercel login`.
2. Ask the AI to read the current schema from Supabase and the diff from GitHub for the change you are shipping.
3. Have Code Reviewer review the diff for correctness, edge cases, and any schema/data risk.
4. Use the Supabase CLI to write and apply the migration the change needs (`supabase migration new`, `supabase db push`).
5. Deploy with the Vercel CLI (`vercel --prod`) and confirm the deployment is live.

## Why these pieces belong together

The kit is coherent because each piece hands off to the next:

- Supabase and GitHub give the work its subject — the real backend and the real diff.
- Code Reviewer gives it a gate — the change is read with method before it ships.
- The Supabase CLI applies the backend change; the Vercel CLI ships the frontend.

Installed separately, the migration and the deploy are two disconnected manual steps with the review easy to skip. Installed together, the kit gives one path: **read the change → review it → migrate the backend → deploy the frontend**.

## Limits

- It does not decide *what* to build; it helps you ship what you have.
- It does not merge, approve, or roll back on your behalf — a human runs the migration and the deploy.
- Supabase, GitHub, and Vercel each require their own accounts, tokens, and CLI logins, and are subject to those plans' limits.
- Migrations touch real data: review destructive changes yourself before `db push`. The kit reviews the diff, it does not guarantee a safe migration.
- It is not a substitute for tests, CI, or a staging environment — use it alongside them, not instead of them.
