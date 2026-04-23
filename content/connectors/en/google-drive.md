---
name: Google Drive
logo: /connectors/google-drive.svg
category: storage
status: available
simpleTitle: "Let your AI read your docs without you opening them"
simpleSubtitle: "Docs, Sheets, Slides — Claude understands them without you copying the text."
devTitle: "Google Drive MCP Connector"
devSubtitle: "Native Drive API access for docs, sheets, slides + fulltext search."
ctaUrl: "https://drive.google.com"
affiliate: false
tagline: "Your Drive's brain, in the agent"
---

You have contracts in Docs, finances in Sheets, pitch decks in Slides. When you ask Claude something, you have to open the file, copy the text, paste it in chat.

With this connector, you say *"review the contract with vendor X"* and the agent finds the doc, reads it, and answers. Fulltext search across your whole Drive.

--- dev ---

Uses Google Drive REST v3 with scoped `drive.readonly` (or `drive.file` for write-back). Claude gets `find_file`, `read_content`, `search`, and `list_recent` tools.

Terminal Sync syncs your OAuth refresh token for Drive separately from the one we use for Terminal Sync itself (they can be the same Google account but different scopes). Both live in the OS Keychain.

**Note**: this connector reads your **main Drive**, not the hidden `appDataFolder` where Terminal Sync stores your encrypted session backups. Those are never exposed to MCP.
