# Skill Content Rules — Gold Mold for Assistants

This file is the source of truth for publishing assistant-style skills in the
TerminalSync catalog. It is the skills equivalent of `content/connectors/SOURCES.md`:
new skills must follow this mold before they can be reviewed for publication.

A skill is not published because it sounds useful. It must prove that it reliably
helps a user do a specific job better than a generic prompt.

## File structure

Every published skill must ship in both languages with strict ES/EN parity:

```text
content/skills/en/<slug>.md
content/skills/es/<slug>.md
```

Rules:

- Use the same `<slug>` in both languages.
- Keep frontmatter fields equivalent across ES/EN unless the value is intentionally localized text.
- Keep the same body sections in both languages.
- Do not publish a skill in only one language.

## Required frontmatter

Every skill file must include these fields:

```yaml
---
name: Skill Name
logo: /skills/<slug>.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Short one-line promise"
description: "Concrete description of what the assistant does and when it helps."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]  # only providers with real delivery + eval — see "Cross-provider coverage"
---
```

Required field meanings:

- `name`: user-facing skill name.
- `logo`: local `/skills/<slug>.svg` path or an approved existing asset.
- `category`: one of the allowed categories below.
- `vendors`: the agent/provider surfaces where this skill can run.
- `author`: original author or maintainer.
- `status`: publication state; use `available` only after review approval.
- `tagline`: short catalog-card promise.
- `description`: concrete, non-hype explanation of the behavior.
- `license`: SPDX identifier when applicable, otherwise `proprietary`.
- `marketplaceSource`: provenance of the skill.
- `compatibleWith`: provider compatibility list surfaced to users.

## Allowed categories

Valid categories are defined in `src/lib/skills.ts`. Do not invent a category
without updating that loader and reviewing the UI impact.

Allowed today:

- `marketing`
- `dev`
- `productivity`
- `research`
- `design`
- `finance`

## Required body sections

Each skill must use the same body section structure in English and Spanish.
Localize the headings, but keep the content equivalent.

English:

```md
## When to use

## What it does

## How to use

## Best for
```

Spanish:

```md
## Cuándo usarlo

## Qué hace

## Cómo usarlo

## Ideal para
```

Section requirements:

- **When to use / Cuándo usarlo**: concrete user situations and triggers.
- **What it does / Qué hace**: specific behaviors, not vague capability claims.
- **How to use / Cómo usarlo**: steps the user can actually follow.
- **Best for / Ideal para**: target users, teams, or workflows.

## Verification gate

No assistant is published only because it sounds good. Every new skill must bring
reproducible evidence in the PR.

### Required eval set

Each skill must include at least 5 test cases in the PR evidence:

1. 3 normal cases where the skill should help.
2. 1 ambiguous case where the skill should ask a clarifying question or state assumptions.
3. 1 refusal / boundary case where the skill should refuse, narrow scope, or ask for a safer framing.

The tests must be reproducible: include the input prompt, the expected behavior,
and the actual output or summarized result.

Reproducibility is mechanized by the skills-eval harness
(`scripts/skills-eval/`): encode the cases as a fixture
(`scripts/skills-eval/fixtures/<slug>.json`) and run
`node scripts/skills-eval/run-evals.mjs <slug>` to generate the baseline-vs-skill
evidence report at `docs/skills-evals/<slug>.md`. The harness produces evidence
only — see "Evidence is not the verdict" below.

### Baseline comparison

The skill must be compared against an equivalent generic prompt.

Required evidence:

- Generic baseline prompt.
- Skill-enabled prompt.
- Outputs from both runs.
- Specific differences that matter to the user: correctness, structure, speed,
  safer boundaries, better use of context, fewer hallucinations, or clearer next steps.

If the skill does not clearly beat the generic baseline, it does not publish.

### Cross-provider coverage (claude / codex / gemini)

`compatibleWith` is a claim to the user, not a default. A skill may only declare
a provider that has **both** a real delivery path **and** eval evidence.

Delivery reality today:

- **Claude** and **Codex** are deliverable: the catalog raw endpoint emits
  `vendors` and the same `SKILL.md`, and the desktop writes it to
  `~/.claude/skills/<slug>/` and `~/.codex/skills/<slug>/` (`skills_sync`,
  `Vendor::{Claude, Codex}`). These are the only two `SkillVendor` values.
- **Gemini has no delivery path yet** — it is not a `SkillVendor`, the raw
  endpoint filters it out, and the desktop has no Gemini skills directory. Do
  **not** put `gemini` in `compatibleWith` until that path ships (context
  injection, e.g. `GEMINI.md` / system-prompt preamble) **and** the skill is
  evaluated on it. The default template is `["claude", "codex"]`.

Evaluation rule:

- Run the eval set on **each** provider the skill claims in `compatibleWith`,
  not on Claude alone. The skills-eval harness takes a `provider` dimension for
  this; the report shows per-provider results.
- The skill must beat its baseline on every claimed provider. If it only clears
  the bar on Claude, narrow `compatibleWith` to `["claude"]` — do not ship a
  multi-AI claim backed by one-AI evidence.
- A skill whose behavior depends on Claude-specific tools, formatting, or the
  Agent Skills (`SKILL.md`) mechanism is Claude-only until it is rewritten to be
  portable. Flag such coupling in the PR.

### Evidence is not the verdict

The evals produce evidence, not the final verdict.

The AI that generates the skill cannot approve its own work. It is judge and party.
The PR must include eval results, but the decision that the skill beats the baseline
belongs to JM / human review.

## Prohibitions

Do not publish a skill that:

- Repackages an obvious prompt with no demonstrated improvement over baseline.
- Makes medical, legal, or financial claims without explicit boundaries and safety language.
- Depends on tools, connectors, files, apps, or runtimes that are not installed or documented.
- Requires secrets, API keys, private credentials, or user tokens.
- Pretends to guarantee outcomes that depend on external platforms or human decisions.
- Hides limitations, refusal conditions, or cases where the user must provide more context.
- Publishes only an English or only a Spanish version.

## PR checklist

A skill PR must include:

- ES and EN files with matching slugs.
- Required frontmatter in both files.
- Required body sections in both files.
- Valid category from `src/lib/skills.ts`.
- At least 5 reproducible eval cases.
- Baseline comparison evidence.
- Human-review note that the evals are evidence, not self-approval.
- Clear list of limitations, refusal conditions, or clarification triggers.

Until these are present, keep the skill out of the published catalog.
