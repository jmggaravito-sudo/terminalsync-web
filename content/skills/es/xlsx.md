---
name: XLSX
vendor: anthropic
logo: /skills/xlsx.svg
category: documents
status: available
simpleTitle: "Hojas de cálculo que se llenan solas"
simpleSubtitle: "Tablas dinámicas, fórmulas, gráficos — describí qué querés y Claude arma el .xlsx."
devTitle: "XLSX Skill"
devSubtitle: "Skill oficial de Anthropic para workbooks `.xlsx`: fórmulas, pivots, charts, formato condicional."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "Excel sin cazar fórmulas"
tsInstallable: true
hidden: true
---
*"Tomá este CSV de ventas del mes pasado, armá un P&L por región con gráfico, y resaltá en rojo las regiones bajo target."* Claude arma el workbook — vos lo abrís en Numbers o Excel y lo presentás.

Funciona genial con el conector de Supabase para análisis directo desde tu DB.

--- dev ---

La skill oficial XLSX habla semántica `openpyxl`:

- Workbooks multi-hoja con named ranges
- Fórmulas, incluyendo array formulas y cadenas SUMIFS
- Tablas dinámicas y objetos chart
- Formato condicional y validación de datos
- Frozen panes, celdas merge, estilos de tabla

Sincronizada vía Terminal Sync a `~/.claude/skills/xlsx/` en todas tus Macs.
