---
name: Dropbox
logo: /connectors/dropbox.svg
category: storage
status: available
simpleTitle: "Your Dropbox, findable by voice"
simpleSubtitle: "\"Find the contract for client X\" \"Send me March's invoice\" — the AI searches your Dropbox for you."
devTitle: "Dropbox Connector (first-party)"
devSubtitle: "TerminalSync's own MCP server over the official Dropbox API v2 — list, search, temporary links, gated public share links."
ctaUrl: "https://www.dropbox.com"
tokenHelpUrl: "https://www.dropbox.com/developers/apps"
affiliate: false
tagline: "Find and share files, hands-free"
originalAuthor: "Dropbox (API v2) · connector by Terminal Sync"
originalAuthorUrl: "https://www.dropbox.com/developers/documentation"
license: "proprietary"
---
When the files that run your business live in **Dropbox** — contracts, invoices, proposals, photos — finding the right one is half the job. This connector puts your AI on it: ask for a file in plain words and it searches, finds it, and hands you a link. No digging through folders.

Ask *"find the contract for client León"* and it searches and gives you the file. Ask *"send me a link to March's invoice"* and it makes a temporary download link. Say *"share the catalog folder with a public link"* and it creates one — but only after it shows you and you confirm, because a public link is visible to anyone who has it.

### What you can ask

- *"Look for the signed proposal from the García project and give me the link."*
- *"What's in my 'Facturas' folder from this month?"*
- *"Create a public share link for the price list PDF."*

### How it connects

Dropbox is a **first-party connector**: it runs Terminal Sync's own small server over Dropbox's official API — there's no npm package to install. You connect it in the app (Settings → Integrations → Dropbox), and your access token is stored encrypted in your Keychain and synced across your machines.

Reading and searching are free; **creating a public share link is outward-facing**, so the AI shows you what it will share and only creates the link when you confirm.

> Heads up: to connect, create a Dropbox app in the developer console and generate an access token — the in-app support chat can walk you through it. (An OAuth "Connect with Dropbox" flow is on the way.)

--- dev ---

First-party MCP sidecar (`terminalsync-dropbox-mcp`, in the `terminal-sync` repo) over the official Dropbox API v2. Endpoints sourced from the official `dropbox` npm SDK (v10.37.1).

Tools:

- **Read**: `dropbox_account` (get_current_account — who's connected), `dropbox_list_files` (files/list_folder), `dropbox_search` (files/search_v2), `dropbox_get_link` (files/get_temporary_link — a ~4h download link, not public).
- **Write (gated)**: `dropbox_share_link` (sharing/create_shared_link_with_settings) — SAFE TWO-STEP WRITE. Without `confirm=true` it previews and creates nothing; with `confirm=true` it creates a public link.

Auth is a Dropbox OAuth2 access token, read from the OS keychain (env `DROPBOX_ACCESS_TOKEN` for overrides). Terminal Sync stores the token in your Keychain, synced encrypted across machines with AES-256-GCM. A full OAuth refresh flow is the planned follow-up so the token doesn't have to be re-pasted.

License: the connector code is Terminal Sync's; the API and data are Dropbox's (proprietary).
