---
name: Intercom
logo: /connectors/intercom.svg
category: support
status: available
simpleTitle: "Your support inbox, handled with you"
simpleSubtitle: "\"Show me the unread conversations\" \"Find customer juan@company.com\" — the AI reviews your Intercom and drafts the reply."
devTitle: "Intercom Connector (first-party)"
devSubtitle: "TerminalSync's own MCP server over the official Intercom API — list conversations, read them, find contacts, and reply with confirmation."
ctaUrl: "https://www.intercom.com"
tokenHelpUrl: "https://developers.intercom.com/building-apps/docs/authentication-types"
affiliate: false
tagline: "Read, understand, and answer your support"
originalAuthor: "Intercom (REST API) · connector by Terminal Sync"
originalAuthorUrl: "https://developers.intercom.com/docs/references/rest-api/api.intercom.io/"
license: "proprietary"
---
When your customers write in through **Intercom** — questions, complaints, requests — keeping up is a job of its own. This connector puts your AI on it: ask it to review your inbox in plain words and it tells you which conversations need attention, finds the customer you're looking for, and drafts the reply for you.

Ask *"what conversations do I have unread?"* and it lists what's pending. Say *"find customer ana@company.com"* and it pulls up their record. Ask *"reply that we've already fixed it"* and it writes the response — but only sends it after showing you and getting your confirmation, because a reply is seen by the customer.

### What you can ask it

- *"Show me the unread support conversations."*
- *"Read this customer's conversation and summarize the problem."*
- *"Reply to this conversation that we shipped the replacement today."*

### How it connects

Intercom is a **first-party connector**: it runs Terminal Sync's small server over the official Intercom API — there's no npm package to install. You connect it from the app (Settings → Integrations → Intercom), and your access token is stored encrypted in your Keychain and synced across your machines.

Reading and searching run freely; **replying to a customer goes outward**, so the AI shows you what it will send and only sends the reply once you confirm.

> Note: to connect, generate an access token from Intercom's Developer Hub — the in-app support chat walks you through it. (A "Connect with Intercom" OAuth flow is on the way.)

--- dev ---

First-party MCP sidecar (`terminalsync-intercom-mcp`, in the `terminal-sync` repo) over the official Intercom REST API (base `api.intercom.io`, header `Intercom-Version: 2.11`). Endpoints sourced from the official `intercom-client` npm SDK (v7.x).

Tools:

- **Reads**: `intercom_me` (GET /me — who's connected), `intercom_list_conversations` (GET /conversations — id, open/closed state, read/unread), `intercom_get_conversation` (GET /conversations/{id} — every message), `intercom_find_contact` (POST /contacts/search by email).
- **Write (gated)**: `intercom_reply` (POST /conversations/{id}/reply, `message_type: comment`, `type: admin`) — SAFE TWO-STEP WRITE. Without `confirm=true` it previews and sends nothing; with `confirm=true` it first resolves the `admin_id` via GET /me and then sends the reply.

Intercom message bodies come as HTML, so the sidecar strips them to plain text before showing them. Auth is an Intercom access token (an app Access Token, or a Personal Access Token), read from the OS keychain (env `INTERCOM_ACCESS_TOKEN` for overrides). Terminal Sync stores the token in your Keychain, synced encrypted across machines with AES-256-GCM. A full OAuth flow is the planned follow-up so the token doesn't need re-pasting.

License: the connector code is Terminal Sync's; the API and data are Intercom's (proprietary).
