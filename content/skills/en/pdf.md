---
name: PDF
vendor: anthropic
author: "Anthropic"
logo: /skills/pdf.svg
category: productivity
status: available
simpleTitle: "Edit, fill and generate PDFs without copy-pasting"
simpleSubtitle: "Tell Claude what you need — invoices, contracts, forms — and it builds the PDF for you."
devTitle: "PDF Skill"
devSubtitle: "Anthropic's official skill for generating, filling and parsing PDF files using `pdf-lib` + `pdfplumber` under the hood."
ctaUrl: "https://docs.claude.com/en/docs/agent-skills"
affiliate: false
tagline: "Editable PDFs straight from a prompt"
tsInstallable: true
included: true
---
Stop fighting with PDFs. Ask Claude to *"fill this contract with the data from my CRM and email it to the client"* — done. Generate quotes, invoices, NDAs in your tone, signed and ready.

The PDF skill ships with form-filling, page extraction, and merging. Pair it with your Notion or Drive connector and Claude has end-to-end document workflows.

--- dev ---

The official Anthropic PDF skill exposes a tool layer over `pdf-lib` for generation/editing and `pdfplumber` for parsing. It handles:

- Filling AcroForm fields by key
- Extracting text + tables from arbitrary PDFs
- Composing multi-page documents from templates
- Merging, splitting, rotating, watermarking

Once installed via Terminal Sync, the skill lives at `~/.claude/skills/pdf/` and is automatically available to Claude Code on every Mac you sign in to. No re-installation, no per-machine config.
