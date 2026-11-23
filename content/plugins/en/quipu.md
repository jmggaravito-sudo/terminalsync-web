---
name: Quipu
logo: /plugins/quipu.svg
category: operations
status: available
tagline: "See which Quipu invoices are still unpaid, and get the chase for each client drafted."
description: "Bundles the Quipu connector (TerminalSync community MCP over the Quipu API: your contacts, invoices and book entries) with Overdue Invoice Chaser (turns an overdue list into a reminder → firm follow-up → final notice ladder, within your terms), so chasing what you're owed starts from the invoice record — who owes, how late, for how much — instead of from memory."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: quipu
skillSlugs: ["cobros-vencidos"]
---
## When to use

- You invoice through Quipu and chasing unpaid invoices lives in your head: who owes you, since when, and what you already told them last time.
- You want the follow-up to escalate in steps that match how late each client is — a nudge first, a firm note later, a final notice last — instead of one angry email for everyone.
- The connector's own documentation uses this job as its example: *"Find the client Fisioterapia Ana and tell me if she has unpaid invoices."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Quipu (the connector)** is the TerminalSync community MCP over the Quipu API: with your Quipu API credentials, the agent reads your invoices (free-text search and by period), your contacts (filterable by tax ID, kind or country) and your book entries — so it can see the invoice, the client behind it and whether the money came in.
- **Overdue Invoice Chaser (the skill)** turns that unpaid list into a message ladder: the friendly reminder, the firm follow-up, the final notice — each carrying the invoice number, the amount, the due date and the days late. It asks for what's missing (prior contact, agreed terms) instead of inventing it, and it never invents interest, fees or legal consequences beyond the terms you gave it.

**A real example:** *"Which clients of mine have unpaid invoices? Draft the follow-up for each."* The agent searches your Quipu invoices and contacts, the skill sorts who gets the nudge and who gets the firm note, and drafts each message with the real amounts and dates. You send them from your own email.

## How to use

1. Install the Plugin and connect Quipu with your API v1 credentials (App ID, App secret and your account slug — Quipu shows them under Configuración → Integraciones → API v1).
2. Ask which invoices are unpaid and how late each one is. The agent reads them from your account instead of you typing the list by hand.
3. Give the skill what the invoice record doesn't show: what you already told this client, and the payment terms you agreed. It asks for what's missing rather than guessing.
4. Review the drafted messages and send them yourself from your own email.

## Why the bundle works

The skill alone is a good writer working blind — the overdue list would arrive from your memory. The connector alone can see the invoices and answer "does she have unpaid ones?", but the reminder wording is left to you. Together: the chase starts from the real record (who owes, how late, for how much) and each client gets the message that matches their stage of late.

## Limits

- **This pack reads and drafts; it doesn't send.** The connector reads invoices, contacts and book entries — the reminder leaves from your own email, not from Quipu.
- This connector is a **TerminalSync community project, not built or endorsed by Quipu/TeamSystem** — the same disclosure its own body carries. Writes were verified by the connector against a real account (a contact and an income invoice, created and read back); this pack uses only the read side.
- The connector's surface is invoicing, contacts and book entries. Expenses by entry, paysheets, bank reconciliation and tax filings are outside it — and outside this job.
- The connector knows the invoice record, not your relationship: prior contact and agreed terms come from you, and the skill asks instead of filling the gap with something plausible.
- The skill never promises the client will pay, and it won't threaten consequences that aren't in your terms. For serious debt it's a drafting aid — not a lawyer or a collection agency.
