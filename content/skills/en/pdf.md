---
name: PDF
logo: /skills/pdf.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Editable PDFs straight from a prompt"
description: "Reads, fills, merges, splits, watermarks, and generates PDFs — including detecting and filling real AcroForm fields instead of retyping a form as chat text. Ships natively with Claude; nothing to install."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## When to use

- You have a PDF form to fill out — a vendor form, an application, an intake sheet — and want the real fields filled, not a text summary of what should go where.
- You need to combine several PDFs into one, split one apart, rotate pages, or stamp a watermark across a contract before sending it out.
- You need text or tables pulled out of a PDF (including a scanned one that needs OCR first) to reuse elsewhere.
- You want a new PDF generated — a quote, invoice, or one-pager — as an actual file.

Do not use it for Word documents, slide decks, or spreadsheets — that's the DOCX, PPTX, or XLSX skill.

## What it does

- **Fills forms correctly**: checks whether the PDF has real fillable fields first. If it does, fills each field (text, checkbox, radio group, multiple choice) by its actual field ID and value — never by guessing coordinates or faking a filled look with an image.
- **Reads and extracts** text and tables from existing PDFs, including running OCR on a scanned document to make it searchable.
- **Merges, splits, and reorders** pages across multiple PDFs while preserving page order.
- **Rotates, watermarks, and encrypts/decrypts** a PDF without altering the underlying content.
- **Generates new PDFs** from scratch for quotes, invoices, letters, and similar one-off documents.

## How to use

1. Share the PDF and say exactly what you need: *"Fill this form with [the specific values]"* or *"Merge these three invoices into one, in date order."*
2. For a form, Claude checks whether it has fillable fields before doing anything — if it doesn't, say so instead of getting a fake-looking result.
3. Give the real data to fill in — Claude does not invent names, amounts, or dates that weren't provided.
4. Review the exported PDF before sending it, especially for anything with legal or financial weight (contracts, signed forms) — the skill fills and formats accurately, but the content and the decision to send it are still yours.

## Best for

Business owners and teams who need a real, correctly filled or assembled PDF — forms, contracts, invoices, merged reports — without hunting for a separate PDF editor.
