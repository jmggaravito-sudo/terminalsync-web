# Integration Supervision Loop

This loop is the guardrail after the four marketplace creation loops
(connectors, plugins, kits, skills). Its job is not to discover new items. Its
job is to stop broken UX from reaching the desktop app.

## What it supervises

For the public `/api/marketplace/catalog` contract:

- every public kit has the TerminalSync kit logo (`/logos/ts-kit.svg`), not an
  empty/generic tile;
- every public kit exposes a real `descriptionMd` explanation for the app detail
  panel;
- every kit has a web `href` and at least one resolved item;
- every resolved kit item has a name and tagline;
- the standard marketplace catalog, kit integrity, plugin integrity, skills and
  logo tests stay green.

## When it runs

- manually via `workflow_dispatch` when JM spots a UX mismatch;
- weekly after the four Monday creation loops, so Tuesday starts with a clean
  mirror surface;
- on PRs that touch catalog content, marketplace APIs, integration UI, or this
  workflow.

## Human policy

If this loop fails, do not merge the corresponding app/landing pair. Fix the
catalog contract first, then re-smoke the app Integraciones panel.
