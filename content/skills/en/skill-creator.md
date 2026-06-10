---
name: Skill Creator
logo: /skills/skill-creator.svg
category: productivity
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Build, improve and measure your own skills"
description: "Guides you through creating new skills, refining existing ones, and measuring their actual performance."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You want to create a new skill for a recurring task.
- You have a skill that doesn't always behave well — and want a structured way to iterate it.
- You need to measure how well a skill performs against real cases.

## What it does

- Helps you define the goal of the skill (when it activates, what it does, what stays out of scope).
- Drafts the SKILL.md following the conventions that work across AIs.
- Suggests test cases to validate it.
- Provides an iteration cycle: draft → test → measure → adjust.

## How to use

1. Tell your AI: *"I want to create a skill for X using `skill-creator`"*.
2. Answer the structured questions (goal, scope, anti-examples).
3. Review the generated SKILL.md and tweak prose.
4. Run the test cases the skill suggests; adjust until it converges.

## Best for

Power users with recurring use cases that justify converting their prompts into reusable skills. Solo builders who want their AI to specialize in their domain without depending on a third-party catalog.
