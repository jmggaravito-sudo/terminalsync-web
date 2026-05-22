---
name: PDF
vendor: anthropic
logo: /skills/pdf.svg
category: documents
status: available
simpleTitle: "Editá, llená y generá PDFs sin copiar y pegar"
simpleSubtitle: "Dile a Claude qué necesitás — facturas, contratos, formularios — y arma el PDF por vos."
devTitle: "PDF Skill"
devSubtitle: "Skill oficial de Anthropic para generar, llenar y parsear PDFs usando `pdf-lib` + `pdfplumber`."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "PDFs editables directo desde un prompt"
tsInstallable: true
---

Dejá de pelear con los PDFs. Decile a Claude *"llename este contrato con los datos del cliente del CRM y mandalo por mail"* — listo. Generá cotizaciones, facturas, acuerdos en tu tono, firmados y listos.

La skill viene con llenado de formularios, extracción de páginas y merge. Combinala con tu conector de Notion o Drive y Claude tiene flujos de documentos end-to-end.

--- dev ---

La skill oficial de Anthropic expone un toolset sobre `pdf-lib` para generación/edición y `pdfplumber` para parsing. Maneja:

- Llenado de campos AcroForm por clave
- Extracción de texto + tablas de cualquier PDF
- Composición de documentos multi-página desde templates
- Merge, split, rotación, watermarks

Una vez instalada vía Terminal Sync, la skill vive en `~/.claude/skills/pdf/` y queda disponible automáticamente en cada Mac donde tengas sesión. Sin re-instalar, sin config por máquina.
