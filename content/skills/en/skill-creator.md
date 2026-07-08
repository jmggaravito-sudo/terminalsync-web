---
name: Skill Creator
logo: /skills/skill-creator.svg
category: productivity
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Create skills that beat baseline"
description: "Guides new skills from recurring use case to RULES.md-compliant content, evals, baseline comparison, boundaries, and iteration plan."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You have a recurring task and suspect it deserves a reusable skill instead of another saved prompt.
- You need to design or rewrite a skill so it follows TerminalSync's skill mold: complete frontmatter, localized headings, clear scope, boundaries, evals, and baseline evidence.
- You want to test whether the skill really beats a generic prompt before publishing it.
- You maintain a catalog and need a repeatable process for deciding keep, rewrite, merge, or reject.

Do not use it to rubber-stamp weak skills. If the assistant only reformats an obvious prompt, Skill Creator should say it does not clearly beat baseline and recommend not publishing or merging it into a broader template.

## What it does

Turns a proposed skill into a reviewable artifact:

- **Use-case diagnosis**: identifies the real job, trigger phrases, users, required inputs, and non-goals.
- **Mold alignment**: drafts frontmatter and body sections matching `content/skills/RULES.md` in English and Spanish.
- **Process design**: captures the expertise or workflow the skill should enforce, not just the output format.
- **Boundary design**: defines clarification triggers, refusals, dependencies, safety limits, and claims the skill must not make.
- **Evidence plan**: creates at least 5 evals: 3 normal, 1 ambiguous, 1 refusal/boundary.
- **Baseline comparison**: writes generic prompt, skill prompt, summarized outputs, differences, and honest verdict.

It should explicitly say when evidence is insufficient. The skill can generate evals and draft content, but human review decides whether the skill publishes.

## How to use

1. Describe the recurring task, current prompt, desired user, and examples of good/bad outputs.
2. Ask Skill Creator to decide whether this deserves a skill or should stay a prompt/template.
3. If it qualifies, generate the skill with the required frontmatter and headings from `RULES.md`.
4. Generate the 5 evals plus generic baseline comparison before publication.
5. Iterate until the skill demonstrates a real process or expertise advantage over the generic baseline.

## Best for

Catalog maintainers, power users, teams standardizing assistant behavior, and builders converting repeated workflows into reliable skills. Best when there are real examples to test; weak when the proposed skill is just a renamed prompt with no distinct process.
