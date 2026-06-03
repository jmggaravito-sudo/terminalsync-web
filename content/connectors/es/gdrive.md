---
name: Google Drive
logo: /connectors/gdrive.svg
category: productivity
status: available
simpleTitle: "Tu Drive hablándole a tu IA (versión Anthropic)"
simpleSubtitle: "Leé documentos, buscá archivos, resumí sheets — OAuth directo sin intermediarios."
devTitle: "Google Drive MCP (Anthropic first-party)"
devSubtitle: "OAuth directo a Drive. Files API + export de Docs/Sheets/Slides."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive"
affiliate: false
tagline: "Drive directo, sin intermediarios"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "web"
---
Nota: este es el conector first-party de Anthropic para Drive — distinto del conector curado de TerminalSync. Ambos funcionan; éste es la implementación oficial de Anthropic incluida en el marketplace como alternativa multi-IA.

--- dev ---

`@modelcontextprotocol/server-gdrive` usa OAuth 2.0 con archivo de credenciales. Operaciones: `search`, lectura de archivos, export Google Docs/Sheets/Slides a texto/CSV. Licencia: MIT.
