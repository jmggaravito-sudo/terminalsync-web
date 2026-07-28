---
name: HubSpot
logo: /connectors/hubspot.svg
category: automation
status: available
simpleTitle: "Your CRM, working while you talk"
simpleSubtitle: "\"Which clients haven't bought in 60 days?\" \"Log a call with María\" — your AI reads and updates your CRM."
devTitle: "HubSpot MCP Connector"
devSubtitle: "Official HubSpot MCP over the CRM API — list/search objects, batch create/update, properties, associations, engagements."
ctaUrl: "https://www.hubspot.com"
tokenHelpUrl: "https://developers.hubspot.com/docs/api/private-apps"
manifest:
  mcpServers:
    hubspot:
      command: npx
      args: ["-y", "@hubspot/mcp-server"]
      env:
        PRIVATE_APP_ACCESS_TOKEN: "${SECRET:HUBSPOT_PRIVATE_APP_ACCESS_TOKEN}"
affiliate: false
tagline: "Contacts, deals and follow-ups at AI reach"
originalAuthor: "HubSpot"
originalAuthorUrl: "https://developers.hubspot.com/mcp"
license: "MIT"
---
Your CRM is where the relationship with every client lives — who they are, what they bought, what you promised, when you last talked. If you run that on **HubSpot**, this connector lets your AI read it and keep it up to date, so the follow-ups don't fall through the cracks while you're busy running the business.

Ask *"which clients haven't bought in 60 days?"* and it searches your contacts and hands you the list. Say *"log a call with María García and set a task to follow up Friday"* and it writes the note and creates the task. The CRM stops being the thing you forget to update.

### What you can ask

- *"Find the deals stuck in 'Proposal' with no activity in the last two weeks."*
- *"Add a note to Carlos Pérez's contact: 'Interested in the annual plan, call back Tuesday.'"*
- *"List the contacts we tagged as leads this month and how we got each one."*

### What you need

HubSpot connects with a **Private App access token** — a key you create inside your own HubSpot account:

1. In HubSpot, go to **Settings → Integrations → Private Apps** (or open [developers.hubspot.com/docs/api/private-apps](https://developers.hubspot.com/docs/api/private-apps)).
2. Create a private app, name it something like "Terminal Sync", and set the **scopes** you want — start with **read-only** CRM scopes (contacts, deals, companies) and add write scopes only when you want the AI to edit.
3. Copy the generated **access token** and paste it when the Lab asks for `HUBSPOT_PRIVATE_APP_ACCESS_TOKEN`.

The token is stored encrypted in your Keychain and synced across your machines. The scopes you pick decide exactly what the AI can see and do — start narrow, widen later.

--- dev ---

`@hubspot/mcp-server` (published by **HubSpot**, official — beta) speaks the HubSpot CRM API. Tools verified against the package README:

- **Objects**: `hubspot-list-objects`, `hubspot-search-objects` (complex property filters), `hubspot-batch-create-objects`, `hubspot-batch-update-objects`, `hubspot-batch-read-objects`, `hubspot-get-schemas`.
- **Properties**: `hubspot-list-properties`, `hubspot-get-property`, `hubspot-create-property`, `hubspot-update-property`.
- **Associations**: `hubspot-batch-create-associations`, `hubspot-list-associations`, `hubspot-get-association-definitions`.
- **Engagements**: `hubspot-create-engagement` (Notes / Tasks on contacts, companies, deals, tickets).
- **Auth**: `hubspot-get-user-details` (validates the token, returns hub + scopes).

Auth via `PRIVATE_APP_ACCESS_TOKEN` (a HubSpot private-app token). Scopes are chosen when you create the app — read-only first is the README's own recommendation.

Terminal Sync keeps the token in your Keychain, synced encrypted across machines with AES-256-GCM. Because the batch-create/update tools mutate real CRM records, the desktop gates those behind a confirmation step.

License: MIT. Source: developers.hubspot.com/mcp.
