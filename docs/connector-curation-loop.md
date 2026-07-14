# Connector Curation Loop protocol

The Connector Curation Loop is run by an agent from the approved prompt/protocol.
It is **not** `scripts/auto_promote_connectors.mjs`; that file belongs to the old
auto-promotion pipeline and must not be used as the Loop entrypoint.

## Run shape

1. Start from the current `origin/main`.
2. Create a fresh branch for the curation run.
3. Discover candidates from the approved source scope.
4. Verify each candidate against official sources:
   - package exists in npm or the approved registry source;
   - publisher/maintainer is trusted;
   - no canary, alpha, typo-squat, SDK-only, or protocol-test package is published as a user-facing connector;
   - README/source material was checked directly.
5. Write approved connectors in `content/connectors/en` and `content/connectors/es` using the gold mold and `content/connectors/SOURCES.md` rules.
6. Source the **official vendor logo** for each new connector (SOURCES.md rule #9) and vendorize it under `public/connectors/`. When the official logo can't be obtained in the run's environment, ship the TS fallback, record it in the "Logos pendientes" backlog of `content/connectors/SOURCES.md`, and flag it in the PR — a fallback logo is a debt the **next** Loop run must close, not a finished state.
7. Document SKIPs in `content/connectors/SOURCES.md`.
8. Before finishing, clear any items in the "Logos pendientes" backlog whose official logo is now obtainable — replacing a fallback counts toward the run.
9. Validate the change and open one draft PR.
10. Stop. Do not merge and do not push to `main`.

## Required run-history registration

After the draft PR exists, the agent must record the completed run with
`scripts/record_loop_run.mjs`:

```bash
LOOP_RUNS_ENDPOINT="https://terminalsync.ai/api/internal/loop-runs" \
LOOP_RUNS_WRITE_TOKEN="$LOOP_RUNS_WRITE_TOKEN" \
node scripts/record_loop_run.mjs \
  --found 3 \
  --skipped 2 \
  --pr "https://github.com/jmggaravito-sudo/terminalsync-web/pull/115"
```

`record_loop_run.mjs` is only the bookkeeping utility that posts to
`/api/internal/loop-runs`; it is **not** the Loop entrypoint.

Number semantics:

- `--found`: connectors added to the catalog in this run.
- `--skipped`: candidate connectors documented as SKIP in this run.

Example: PR #115 added `pdf`, `map`, and `threejs`, and documented SKIPs for
`everything` and `server-sdk`, so the registration numbers are `--found 3` and
`--skipped 2`.
