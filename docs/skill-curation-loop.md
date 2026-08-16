# Skill Curation Loop protocol

The Skill Curation Loop molds and evaluates assistant-style skills for the TerminalSync marketplace. A Skill only publishes when it clearly helps a user do a specific job better than a generic prompt.

Its gate is `content/skills/RULES.md`.

## Run shape

1. Start from the current `origin/main`.
2. Create a fresh branch for the curation run.
3. Prioritize the documented business-friendly backlog (`docx`, `pdf`, `pptx`, `xlsx`) unless a workflow input says otherwise.
4. Write or update strict EN/ES parity content in `content/skills/en` and `content/skills/es`.
5. **I18n gate before PR:** `tagline`, `description`, body/headings in `content/skills/en` and `content/skills/es` must be localized for the file language; no copied opened-description fallback.
5. Add reproducible eval fixtures under `scripts/skills-eval/fixtures/<slug>.json`.
6. Run `node scripts/skills-eval/run-evals.mjs <slug>` and commit the report under `docs/skills-evals/<slug>.md`.
7. Publish only if the skill clearly beats the baseline for every claimed provider.
8. Validate with skills tests, logo tests, and typecheck when feasible.
9. Open the landing/web draft PR.
10. Open the app mirror draft PR following `docs/integration-loop-two-pr-policy.md`.
11. Stop. Do not merge and do not push to `main`.

## Run-history registration

After the draft PR exists, record the completed run with `--kind skills` and the landing slugs:

```bash
LOOP_RUNS_ENDPOINT="https://terminalsync.ai/api/internal/loop-runs" \
LOOP_RUNS_WRITE_TOKEN="$LOOP_RUNS_WRITE_TOKEN" \
node scripts/record_loop_run.mjs \
  --kind skills \
  --found 1 \
  --skipped 2 \
  --items "docx" \
  --pr "https://github.com/jmggaravito-sudo/terminalsync-web/pull/123"
```

`/admin/ops/loop-runs` links skill slugs to `/es/skills/<slug>`.
