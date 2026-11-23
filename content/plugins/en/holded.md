---
name: Holded
logo: /plugins/holded.svg
category: operations
status: available
tagline: "See which Holded invoices are actually unpaid, and get the chase for each client drafted."
description: "Bundles the Holded connector (official hosted Holded MCP: your invoicing, contacts and business data over your own Holded login) with Overdue Invoice Chaser (turns an overdue list into a reminder → firm follow-up → final notice ladder, within your terms), so chasing what you're owed starts from the invoice record — who owes, how late, for how much — instead of from memory."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: holded
skillSlugs: ["cobros-vencidos"]
---
## When to use

- You run your day-to-day on Holded and chasing unpaid invoices lives in your head: who owes you, since when, and what you already told them last time.
- You want the follow-up to escalate in steps that match how late each client is — a nudge first, a firm note later, a final notice last — instead of one angry email for everyone.
- The connector's own documentation uses this job as its example: *"Show me this month's unpaid invoices and what the total adds up to."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Holded (the connector)** is the official hosted Holded MCP (`mcp.holded.com`): with your own Holded login (no API key to paste), the agent reads your invoices and their line items, your contacts and their details — the invoice number, the amount, the client, what's still open.
- **Overdue Invoice Chaser (the skill)** turns that unpaid list into a message ladder: the friendly reminder, the firm follow-up, the final notice — each carrying the invoice number, the amount, the due date and the days late. It asks for what's missing (prior contact, agreed terms) instead of inventing it, and it never invents interest, fees or legal consequences beyond the terms you gave it.

**A real example:** *"Which of my Holded invoices are still unpaid? Draft the follow-up for each."* The agent pulls the unpaid ones from your account, the skill sorts who gets the nudge and who gets the firm note, and drafts each message with the real amounts and dates. You send them from your own email.

## How to use

1. Install the Plugin and connect Holded — no API key; you log in with your own account and approve the access.
2. Ask which invoices are unpaid and how long each one has been open. The agent reads them from your account instead of you typing the list by hand.
3. Give the skill what the invoice record doesn't show: what you already told this client, and the payment terms you agreed. It asks for what's missing rather than guessing.
4. Review the drafted messages and send them yourself from your own email.

## Why the bundle works

The skill alone is a good writer working blind — the overdue list would arrive from your memory. The connector alone can see the invoices, but a bare "unpaid?" answer leaves the wording to you. Together: the chase starts from the real record (who owes, how late, for how much) and each client gets the message that matches their stage of late. Holded's own line for its MCP is *"The AI drafts and organizes; you issue and collect"* — that is exactly this division of labor: the pack drafts the chase, you send it and collect.

## Limits

- **This pack reads and drafts; it doesn't send.** Under Holded's own permission profiles, invoices and tax documents are read-only for the AI, so the reminder leaves from your own email — there is no "send it from Holded" step in this pack.
- The connector knows the invoice record, not your relationship: prior contact and agreed terms come from you, and the skill asks instead of filling the gap with something plausible.
- The skill never promises the client will pay, and it won't threaten consequences that aren't in your terms. For serious debt it's a drafting aid — not a lawyer or a collection agency.
- Holded's MCP covers much more than invoicing (CRM, projects, inventory — 360 documented tools). This pack uses the invoicing-and-contacts slice only, and it doesn't create or modify anything in your account.
- This is a server hosted by Holded (`mcp.holded.com`), not something on your computer: what the agent can see is bounded by the profile you authorize (Analytical, read-only, is the preselected one). Holded's API is available on paid plans, not on Free.
