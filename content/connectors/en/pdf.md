---
name: PDF
logo: /connectors/pdf.svg
category: productivity
status: available
simpleTitle: "Let your AI read and mark up PDFs"
simpleSubtitle: "Open local papers or approved research URLs, search pages, extract text and annotate documents."
devTitle: "PDF MCP Connector"
devSubtitle: "Official @modelcontextprotocol MCP App server: interactive PDF viewer, chunked reads, annotations and save gates."
ctaUrl: "https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/pdf-server"
manifest:
  mcpServers:
    pdf:
      command: npx
      args: ["-y", "--silent", "--registry=https://registry.npmjs.org/", "@modelcontextprotocol/server-pdf", "--stdio"]
affiliate: false
tagline: "PDF reading, search and annotations for the agent"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-pdf"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/ext-apps/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**PDF** is the document format people use for papers, reports, contracts and forms. The official `@modelcontextprotocol` server opens an interactive PDF viewer and supports local files plus remote URLs from approved academic sources such as arXiv, bioRxiv, Zenodo and others.

What it does: your AI can list available PDFs, display a document, search inside it, move to a page, extract text from selected pages, take a screenshot, add highlights or notes, stamp pages, fill forms and save an annotated copy when the file is in an allowed local root. The README describes the core pattern as *"chunked pagination"* so large PDFs do not need to travel in one oversized tool call.

### What you can ask

- *"Open this research paper and summarize the argument from pages 1 to 3."*
- *"Search this contract for cancellation terms and highlight the important paragraph."*
- *"Add a confidential stamp to every page and save a new annotated copy."*

### What configuration you need

You do not need a token. The connector runs locally with `npx` and can only read local files you pass to it, local folders exposed by client roots, or remote PDFs from the allowed source list.

1. Install it from the Lab like any connector without secrets.
2. Open PDFs only from folders you are comfortable exposing to the agent.
3. For saving annotations, use a mounted local directory root; the server refuses writes outside allowed roots.

Be careful with confidential documents. This connector makes PDF contents available to the AI session, so only open files that belong in that workspace.

--- dev ---

`@modelcontextprotocol/server-pdf` is an official package under the `@modelcontextprotocol` scope, published by `ochafik-ant <ochafik@anthropic.com>` with Anthropic/modelcontextprotocol maintainers. Verified package: `@modelcontextprotocol/server-pdf@1.7.4`, dist-tag `latest` only, license MIT, repository `modelcontextprotocol/ext-apps`, directory `examples/pdf-server`.

Verified manifest from the package README: `npx -y --silent --registry=https://registry.npmjs.org/ @modelcontextprotocol/server-pdf --stdio`; no secrets required.

Tools verified against the official README: `list_pdfs`, `display_pdf`, `interact`, `read_pdf_bytes`, `save_pdf`. Visibility notes: `list_pdfs` is model-visible; `display_pdf` is model + UI; `interact` is model-visible and enabled by default in stdio; `read_pdf_bytes` and `save_pdf` are app-only.

Security and transport gotchas: stdio always enables client roots because the client is expected to be local. HTTP ignores client roots by default unless `--use-client-roots` is passed. `interact` requires an in-memory command queue: stdio works by default; HTTP requires `--enable-interact`; stateless multi-instance HTTP should leave it off. Saving annotated PDFs is gated to mounted roots and refuses overwriting unless explicitly requested.

Allowed remote sources named by the README include arxiv.org, biorxiv.org, medrxiv.org, chemrxiv.org, zenodo.org, osf.io, hal.science and ssrn.com.

License: MIT. Source: README and package metadata for `@modelcontextprotocol/server-pdf` on npm, plus `modelcontextprotocol/ext-apps` `examples/pdf-server`.
