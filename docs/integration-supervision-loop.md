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

## Where JM sees it

Every completed supervision run writes a `supervision` row to `/admin/ops/loop-runs`, next to Connectors, Plugins, Kits and Skills. The row links to the GitHub Actions run as evidence, because this loop verifies catalog/app parity instead of publishing new landing item slugs.

## Human policy

If this loop fails, do not merge the corresponding app/landing pair. Fix the
catalog contract first, then re-smoke the app Integraciones panel.


## Landing ↔ app sync gate

For every marketplace PR that touches public integration catalog content, the PR body must link the matching app mirror PR, for example:

```
App mirror: jmggaravito-sudo/terminal-sync/pull/1045
```

The supervision workflow resolves that app PR, checks out its head branch, and runs the app-side drag/install contract tests. If the app mirror is missing, unreachable, or its tests fail, the landing PR must not merge. Scheduled/manual runs verify the current app release branch (`release/v0.2.18-lab`) against the landing main branch.

The app-side parity suite covers:

- Explorer rows emit the correct drag ids (`cn-*`, `sk-*`, `cli-*`, `kit-*`, `pl-*`).
- Plugins dropped from Explore are accepted by the drop target and routed to the plugin installer.
- Kits keep the TS logo fallback and render long catalog explanations.
- External-only connectors stay non-draggable.
- The marketplace catalog wrapper keeps the landing wire shape compatible with the app.

## Physical landing/app parity gate

When a marketplace PR changes public catalog content, the supervision loop now
requires a physical smoke evidence block in the PR body. The goal is to avoid a
false “merged = visible” report.

Required format:

```md
## Physical smoke evidence
- Landing visible: yes
- App visible: yes
- Landing counts: connectors=54 plugins=7 kits=8 skills=21 cliTools=5 total=95
- App counts: connectors=54 plugins=7 kits=8 skills=21 cliTools=5 total=95
```

The check validates three things:

1. the landing routes and catalog loaders can physically expose the changed
   category (including file-based kits on `/stacks` and `/stacks/[slug]`);
2. the desktop app checkout still has all Explore sections (`bundles`,
   `plugins`, `connectors`, `skills`, `cliTools`) and the catalog wrapper can
   point to a landing preview via `VITE_MARKETPLACE_URL`;
3. the counts declared from the physical app smoke match the counts declared
   from the physical landing smoke and match the landing catalog inventory.

If a slug appears on the landing but not in the app, the loop must stay red. The
coordinator should then check whether the app was pointed at the correct landing
preview/production endpoint, whether the matching app PR was merged, and whether
the installed Lab build includes that app SHA.

For items like Xero/Gusto/Bookkeeping/1099, the correct manual smoke is always:

1. open **Integraciones → Explorar** in the installed Lab app, not Instalados;
2. search the public label and any expected business keywords;
3. open the detail panel and confirm description/link are present;
4. compare the category counts shown by the app against the landing catalog
   counts in the workflow summary.
