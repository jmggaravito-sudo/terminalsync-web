---
name: DOCX
logo: /skills/docx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Word docs without the fight"
description: "Creates, edits, and reads Word documents (.docx/.dotx) with real formatting — headings, tables of contents, page numbers, tables, tracked changes — instead of plain text pretending to be a document. Ships natively with Claude; nothing to install."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## When to use

- You need an actual Word file — a proposal, report, letter, memo, contract draft, or template — not just formatted text in the chat window.
- You want structure a plain reply can't give: a working table of contents, real heading styles, page numbers, letterhead, tables, or embedded images.
- You have an existing `.docx` (or a legacy `.doc` that needs converting first) and want it edited, reorganized, or find-and-replaced without losing its formatting, comments, or tracked changes.
- You need content pulled out of a Word file to reuse somewhere else.

Do not use it for PDFs, spreadsheets, slide decks, or Google Docs — that's the PDF, XLSX, or PPTX skill, or a Docs connector.

## What it does

- **Generates new documents** with real Word structures: built-in heading styles (required for a table of contents to populate), numbered/bulleted lists, tables with correctly matched column and cell widths, embedded images, page breaks, and dot-leader alignment — not markdown pretending to be a Word file.
- **Edits existing documents** by opening the underlying file structure directly, changing only what was asked, and leaving everything else — formatting, comments, tracked changes — untouched. Legacy `.doc` files are converted first.
- **Reads and extracts** text and structure from `.docx`/`.dotx` files so the content can be reused elsewhere.
- **Tracked changes and comments**: edits can be attributed to a named reviewer instead of landing as anonymous, unattributed changes.
- **Checks its own output**: after producing a file, the skill renders it to images and looks at the result before handing it back, catching formatting that silently breaks (a shaded table cell rendering solid black, a missing page break) before the user opens it.

## How to use

1. Ask for the deliverable directly: *"Draft a one-page proposal for Acme based on last quarter's wins, use our standard 4-page format."*
2. Share the source material — notes, a CRM export, an existing doc — so Claude works from real content instead of inventing numbers or claims.
3. To edit a file you already have, share it and say exactly what should change: a find-and-replace, a section rewrite, or which tracked changes to accept or reject.
4. Open the exported file in Word, Pages, or Google Docs for a final read. Claude checks its own render for formatting breakage, but tone and business judgment calls are still yours.

## Best for

Non-technical business owners and teams who need a real, properly formatted Word file — proposals, contracts, reports, letters — without opening Word themselves or fighting with template styles.
