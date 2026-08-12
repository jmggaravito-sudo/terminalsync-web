---
name: XLSX
logo: /skills/xlsx.svg
category: productivity
vendors: ["claude"]
author: "Anthropic"
status: available
tagline: "Excel without the formula hunt"
description: "Builds and edits Excel workbooks (.xlsx/.xlsm) with real formulas, conditional formatting, and charts — the sheet recalculates when inputs change, instead of shipping hardcoded numbers that look like formulas. Ships natively with Claude; nothing to install."
license: "proprietary"
licenseUrl: "https://github.com/anthropics/skills/blob/main/skills/xlsx/LICENSE.txt"
marketplaceSource: "anthropic"
compatibleWith: ["claude"]
included: true
---
## When to use

- You need a real spreadsheet — a P&L, a commission calculator, a budget, a data cleanup — not a table of numbers pasted into chat.
- You have an existing workbook and want a column, formula, or sheet added that matches its existing conventions and formatting.
- You want a chart or conditional formatting (like highlighting rows below target) driven by an actual rule, not manually colored cells that go stale the moment the data changes.
- You have messy tabular data (CSV, malformed export) that needs restructuring into a clean, usable file.

Do not use it for Word documents, PDFs, or slide decks — that's the DOCX, PDF, or PPTX skill.

## What it does

- **Builds new workbooks** using real formulas (`=SUM(...)`, `=IF(...)`, and similar) instead of hardcoded totals, so the sheet recalculates correctly if the underlying numbers change.
- **Edits existing files** by finding their designated input cells and matching conventions exactly — it does not silently redesign a sheet's layout or touch formulas it wasn't asked to change.
- **Adds charts and conditional formatting** as native Excel objects driven by rules, not one-time manual coloring.
- **Recalculates every formula before finishing** and reports any cell that errors out, rather than shipping a workbook that reads as blank or broken until the user opens it and recalculates manually.
- **Documents assumptions and hardcoded inputs** — a cell comment or adjacent note explaining where a number came from, instead of a silent, unexplained figure.

## How to use

1. Describe the deliverable and share the source data: *"Take this CSV of sales, build a P&L by region with a chart, highlight regions under $50k in red."*
2. If you're editing an existing workbook, share it — Claude matches its existing tab names, headers, and formatting instead of restructuring it.
3. State the exact rule for any calculation (commission tiers, growth rate, thresholds) — the skill follows the spec you give rather than guessing a "close enough" formula.
4. Open the exported file in Excel or Numbers and spot-check a few cells — a clean recalculation proves the formulas evaluate, not that the underlying logic matches what you actually meant.

## Best for

Business owners and teams who need a real, formula-driven spreadsheet — P&Ls, budgets, commission calculators, cleaned-up data — without building it cell by cell themselves.
