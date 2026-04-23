---
name: Google Drive
logo: /connectors/google-drive.svg
category: storage
status: available
simpleTitle: "Que tu IA lea tus docs sin que los abras"
simpleSubtitle: "Docs, Sheets y Slides — Claude los entiende sin que tengas que copiar el texto."
devTitle: "Google Drive MCP Connector"
devSubtitle: "Native Drive API access for docs, sheets, slides + fulltext search."
ctaUrl: "https://drive.google.com"
affiliate: false
tagline: "El cerebro de tu Drive, en el agente"
---

Tenés contratos en Docs, finanzas en Sheets, pitch decks en Slides. Cuando le pedís algo a Claude, tenés que abrir el archivo, copiar el texto, pegarlo en el chat.

Con este conector, le decís *"revisá el contrato con el proveedor X"* y el agente busca el doc, lo lee, y te responde. Fulltext search sobre todo tu Drive.

--- dev ---

Uses Google Drive REST v3 with scoped `drive.readonly` (or `drive.file` for write-back). Claude gets `find_file`, `read_content`, `search`, and `list_recent` tools.

Terminal Sync syncs your OAuth refresh token for Drive separately from the one we use for Terminal Sync itself (they can be the same Google account but different scopes). Both live in the OS Keychain.

**Note**: this connector reads your **main Drive**, not the hidden `appDataFolder` where Terminal Sync stores your encrypted session backups. Those are never exposed to MCP.
