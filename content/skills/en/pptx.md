---
name: PPTX
logo: /skills/pptx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "PowerPoint at the speed of prompt"
description: "Builds and edits PowerPoint decks (.pptx/.potx) with real slide layouts, native charts, speaker notes, and template reuse — instead of a bullet-point outline pretending to be a deck. Ships natively with Claude; nothing to install."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/pptx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## When to use

- You need an actual slide deck — a sales pitch, an all-hands update, a client review — not a bulleted outline you'd still have to build yourself.
- You have a template deck with your brand layouts and want new slides added or duplicated in that same style, not a generic deck from scratch.
- You need real charts inside the deck (bar, line, pie, combo) built from your actual numbers, not a picture of a chart.
- You want speaker notes added to an existing deck for a presentation you're about to give.

Do not use it for Word documents, PDFs, or spreadsheets — that's the DOCX, PDF, or XLSX skill.

## What it does

- **Builds new decks** with real slide layouts sized to the correct canvas (16:9 widescreen unless told otherwise), native PowerPoint charts built from the data given, and lists rendered as real bullets — not a literal "•" character typed into a text box.
- **Edits existing decks and templates**: duplicates a slide with all its layout intact, reorders or removes slides, and cleans up anything left over from a deletion, so the result still opens cleanly in PowerPoint.
- **Adds speaker notes** as real presenter notes attached to a slide, not visible text pasted onto the slide itself.
- **Reads decks**: extracts the text of every slide, including from a template, so content can be mapped onto the right layout before anything is built.
- **Checks its own output**: after building or editing a deck, it validates the file structure and looks at rendered slide images before handing it back, so a corrupted chart or a broken layout doesn't silently ship.

## How to use

1. Describe the deck: audience, occasion, slide count, and the real numbers or story it needs to carry — e.g. *"a 10-slide client review deck, last month's KPIs, ending with a renewal ask."*
2. If you have a brand template or an existing deck, share it — Claude works from your layouts and colors instead of inventing new ones.
3. Give the actual data for any chart; the skill will not invent figures to fill a slide that looks empty.
4. Open the exported file in PowerPoint or Keynote for a final pass — Claude checks its own render for broken slides, but the pitch and the ask are still your call.

## Best for

Founders, salespeople, and teams who need a real, on-brand slide deck — pitches, client reviews, internal updates — without opening PowerPoint themselves.
