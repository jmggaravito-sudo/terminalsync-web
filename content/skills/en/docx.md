---
name: DOCX
vendor: anthropic
author: "Anthropic"
logo: /skills/docx.svg
category: productivity
status: available
simpleTitle: "Word documents on autopilot"
simpleSubtitle: "Drafts, proposals, reports — Claude writes them in your tone and exports a clean .docx."
devTitle: "DOCX Skill"
devSubtitle: "Anthropic's official skill for `.docx` generation, editing and styling."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "Word docs without the fight"
tsInstallable: true
included: true
---
Tell Claude what you need: *"Draft a proposal for the Acme account based on last quarter's wins, format it as our standard 4-pager"*. Claude writes, formats, and exports the .docx — you open it in Pages or Word and ship.

Pair it with your Notion or Drive connector to pull in the source content automatically.

--- dev ---

The official DOCX skill exposes `python-docx`-style operations through Claude's tool layer:

- Generate documents from templates with placeholder fields
- Apply paragraph and run-level styling (headings, lists, tables)
- Track changes / accept-reject diff workflows
- Embed images, footnotes, headers/footers

After Terminal Sync installs it, the skill lives at `~/.claude/skills/docx/` on every machine — including any Mac you bring online tomorrow.
