---
name: XLSX
vendor: anthropic
logo: /skills/xlsx.svg
category: documents
status: available
simpleTitle: "Spreadsheets that fill themselves"
simpleSubtitle: "Pivot tables, formulas, charts — describe what you want and Claude builds the .xlsx."
devTitle: "XLSX Skill"
devSubtitle: "Anthropic's official skill for `.xlsx` workbooks: formulas, pivots, charts, conditional formatting."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "Excel without the formula hunt"
tsInstallable: true
---

*"Take this CSV of last month's sales, build a P&L by region with a chart, and highlight regions below target in red."* Claude builds the workbook — you open it in Numbers or Excel and present.

Works great with the Supabase connector for analytics pulled straight from your DB.

--- dev ---

The official XLSX skill speaks `openpyxl` semantics:

- Multi-sheet workbooks with named ranges
- Formulas, including array formulas and SUMIFS chains
- Pivot tables and chart objects
- Conditional formatting and data validation
- Frozen panes, merged cells, table styles

Synced via Terminal Sync to `~/.claude/skills/xlsx/` across all your Macs.
