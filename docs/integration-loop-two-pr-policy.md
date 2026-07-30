# Integration Loop two-PR policy

Every TerminalSync integration loop must leave **two reviewable PRs** when it changes what users see or can install:

1. **Landing/Web PR** in `jmggaravito-sudo/terminalsync-web`.
   - Catalog content, public landing pages, marketplace metadata, loop report bookkeeping.
   - This PR is the source of truth for `/api/marketplace/catalog`.

2. **App mirror PR** in `jmggaravito-sudo/terminal-sync`.
   - Mirrors the web catalog behavior inside the desktop app (`Integraciones`, install/CTA behavior, special cases, tests, and support-bot copy).
   - Base branch: `release/v0.2.18-lab` unless the coordinator states otherwise.
   - The app PR must prove the new/changed integration does not render as a broken generic card.

## What counts as an app mirror change

The app PR is required even when the app consumes the remote catalog automatically. If no production code change is needed, the app PR must still include one of:

- a targeted test/fixture proving the remote catalog item renders and routes correctly;
- a support-bot knowledge note for the integration behavior;
- a small app-side copy/CTA adjustment for the exact integration;
- a documented `no-code mirror` assertion explaining why the existing app path covers it.

Examples:

- A connector with a normal `manifest` should be smokeable through `Integraciones → Explorar` and should open the install path instead of a dead external CTA.
- A connector with **no static manifest** (for example, a user-managed MCP like Zapier) must not look one-click installable. The app mirror PR should route it to the correct external/setup flow or explain the manual setup clearly.
- A first-party integration (for example Meta Social) must open its native app flow, not only the generic catalog detail.

## PR body requirements

Both PRs must link to each other when possible.

The landing/web PR body must include:

- `App mirror PR: <url or pending>`
- loop kind (`connectors`, `plugins`, `kits`, or `skills`)
- found/skipped counts
- shipped/promoted landing slugs (`--items`) so the ops report links to `/es/connectors`, `/es/plugins`, `/es/stacks`, or `/es/skills`
- where the run appears: `/admin/ops/loop-runs`

The app PR body must include:

- `Landing/Web PR: <url>`
- what changed in the app surface
- validation/smoke notes
- `## Lo que el bot de soporte debe saber`

## Automation rule

Automated loops should attempt both PRs. If the automation cannot push to the app repo because the required cross-repo token/secret is missing, the loop must:

1. still open the landing/web draft PR;
2. mark the landing/web PR body with `App mirror PR: blocked — missing cross-repo token`;
3. record the blocker in the loop log and `/admin/ops/loop-runs` note when available;
4. never report the integration as fully ready until the app mirror PR exists.

## Loop report menu

`/admin/ops/loop-runs` is the shared menu for all four loops: Connectors, Plugins, Kits, and Skills. Each run should record `--kind` and `--items` so the admin report can link directly to the public landing pages that the desktop app must mirror.
