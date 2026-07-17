# Skills eval harness

Reproducible evidence for the **Skills Loop** — the skills-catalog equivalent of
the Connector Curation Loop. It mechanizes the eval requirement in
[`content/skills/RULES.md`](../../content/skills/RULES.md): every published skill
must ship at least 5 test cases (3 normal, 1 ambiguous, 1 refusal), each compared
against a generic baseline prompt, plus a human-review note that the evals are
**evidence, not the verdict**.

## What it does

For each fixture (`fixtures/<skill>.json`), per case:

1. Asks Claude twice over the same input — once with the **generic baseline**
   prompt, once with the **skill-enabled** prompt.
2. An **LLM judge** compares the two answers against the case's expected
   behavior and returns a structured verdict (scores 0-10, meets-expected,
   beats-baseline, one-line note).
3. Aggregates the verdicts into a Markdown report at
   `docs/skills-evals/<skill>.md`.

It never approves a skill. The generating AI is judge and party; the decision
that a skill beats the baseline belongs to human review. The report carries that
disclaimer, and the harness exits non-zero only on API/parse **errors**, never as
a pass/fail verdict.

## Run it

```bash
# One skill (writes docs/skills-evals/code-reviewer.md)
ANTHROPIC_API_KEY=... node scripts/skills-eval/run-evals.mjs code-reviewer

# All fixtures
ANTHROPIC_API_KEY=... node scripts/skills-eval/run-evals.mjs

# Custom output path (single fixture only)
ANTHROPIC_API_KEY=... node scripts/skills-eval/run-evals.mjs code-reviewer --out docs/skills-evals/code-reviewer.md
```

Model defaults to `claude-opus-4-8`; override with `SKILLS_EVAL_MODEL`.

## DRY_RUN (offline)

No network, no API key — subject answers and judge verdicts are read from files.
This is what the vitest suite uses and what keeps the harness CI-safe.

```bash
DRY_RUN=1 \
DRY_RUN_ANSWERS_FILE=answers.json \
DRY_RUN_JUDGE_FILE=judge.json \
node scripts/skills-eval/run-evals.mjs code-reviewer
```

- `answers.json`: `{ "<caseId>": { "baseline": "...", "skill": "..." }, ... }`
- `judge.json`: `{ "<caseId>": { "baselineScore": 4, "skillScore": 9, "skillMeetsExpected": true, "beatsBaseline": true, "notes": "..." }, ... }`

## Fixture format

`fixtures/<skill>.json`:

```json
{
  "skill": "code-reviewer",
  "name": "Code Reviewer",
  "baselinePrompt": "Review this code diff and tell me if anything is wrong.",
  "skillPrompt": "Use Code Reviewer. Review this diff like a senior reviewer...",
  "cases": [
    { "id": "payment-idempotency", "type": "normal",    "input": "<diff or prompt>", "expected": "<behavior the judge checks for>" },
    { "id": "no-diff-provided",    "type": "ambiguous", "input": "...", "expected": "Ask for a diff instead of inventing findings." },
    { "id": "hide-malware",        "type": "refusal",   "input": "...", "expected": "Refuse to help conceal malicious behavior." }
  ]
}
```

`validateFixture` enforces the RULES.md coverage (>=5 cases, >=3 normal,
>=1 ambiguous, >=1 refusal; unique ids; non-empty fields) and fails fast on a
malformed fixture so bad evidence never gets generated.

## Adding a skill to the Loop

1. Write `fixtures/<slug>.json` from the skill's real eval cases (draw them from
   the human-readable `content/skills/evals/<slug>.md` if one exists).
2. Run the harness with a real key; inspect `docs/skills-evals/<slug>.md`.
3. Attach the report to the skill PR as evidence. **Human review decides
   publication** — the harness only supplies the numbers.

## Tests

Pure functions (`validateFixture`, `buildSubjectPrompt`, `buildJudgePrompt`,
`parseJudge`, `aggregate`, `renderMarkdown`) and the DRY_RUN path are covered by
`run-evals.test.mjs`, which runs under `vitest run` (the config `include` globs
`scripts/**/*.test.mjs`).
