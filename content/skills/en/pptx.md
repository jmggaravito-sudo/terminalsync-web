---
name: PPTX
vendor: anthropic
author: "Anthropic"
logo: /skills/pptx.svg
category: productivity
status: available
simpleTitle: "Decks built in minutes, not afternoons"
simpleSubtitle: "Sales pitches, all-hands updates, client reviews — Claude composes the slides for you."
devTitle: "PPTX Skill"
devSubtitle: "Anthropic's official skill for `.pptx` presentations: layouts, master slides, charts, image embedding."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "PowerPoint at the speed of prompt"
tsInstallable: true
included: true
---
*"Build a 10-slide deck for tomorrow's client review. Pull last month's metrics from Supabase, use our deck template, end with a clear ask."* Claude builds, themes, and exports — you tweak the wording and present.

--- dev ---

The PPTX skill wraps `python-pptx`:

- Slide layouts from a master template
- Charts (bar, line, pie) built from in-memory data
- Image insertion with crop / aspect-fit
- Speaker notes
- Theme color palette consistency

Terminal Sync drops it at `~/.claude/skills/pptx/` and keeps it in sync.
