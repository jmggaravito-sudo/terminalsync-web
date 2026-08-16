# Kit Curation Loop protocol

The Kit Curation Loop packages published pieces into role/workflow bundles for the TerminalSync marketplace. A Kit is a role-level product: several connectors, skills, CLI tools, or plugins that work together for one concrete job.

Its gate is `content/kits/RULES.md`.

## Run shape

1. Start from the current `origin/main`.
2. Create a fresh branch for the curation run.
3. Pick a concrete role/workflow, prioritizing business-owner jobs: sales, support, finance, marketing, operations.
4. Verify every included piece is already published and installable. If a needed piece is missing, defer it to the right Loop.
5. Write the Kit in `content/kits/en` and `content/kits/es` with strict parity.
6. **I18n gate before PR:** `tagline`, `description`, and long `descriptionMd` body must be localized in both `content/kits/en` and `content/kits/es`; no Spanish opened detail in `lang=en`.
6. Use the fixed `/logos/ts-kit.svg` logo.
7. Explain why each piece belongs in the workflow; remove generic filler.
8. Validate with `src/lib/marketplace/kitsIntegrity.test.ts`, catalog tests, and typecheck when feasible.
9. Open the landing/web draft PR.
10. Open the app mirror draft PR following `docs/integration-loop-two-pr-policy.md`.
11. Stop. Do not merge and do not push to `main`.

## Run-history registration

After the draft PR exists, record the completed run with `--kind kits` and the landing slugs:

```bash
LOOP_RUNS_ENDPOINT="https://terminalsync.ai/api/internal/loop-runs" \
LOOP_RUNS_WRITE_TOKEN="$LOOP_RUNS_WRITE_TOKEN" \
node scripts/record_loop_run.mjs \
  --kind kits \
  --found 1 \
  --skipped 2 \
  --items "sales-call-prep" \
  --pr "https://github.com/jmggaravito-sudo/terminalsync-web/pull/123"
```

`/admin/ops/loop-runs` links kit slugs to `/es/stacks/<slug>`.
