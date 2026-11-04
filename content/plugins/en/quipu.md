---
name: Quipu
logo: /plugins/quipu.svg
category: operations
status: available
tagline: "See which Quipu invoices are actually unpaid — and send the collection message each one deserves."
description: "Bundles the Quipu connector (your contacts, invoices and book entries over the Quipu API v1) with Overdue Invoice Chaser (turns the overdue list into a reminder → firm follow-up → final notice ladder, inside your terms), so collection starts from the real invoice record — how many days late, what you already told them — instead of your memory."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: quipu
skillSlugs: ["cobros-vencidos"]
---
## When to use

- You invoice your clients through Quipu and the overdue side lives in your head: who owes, since when, and what you last told them.
- You want the follow-up to escalate step by step depending on how late each client is — a nudge first, a firm note later, the final notice at the end — instead of one angry email for everyone.
- The connector's own documentation uses this job as an example: *"Find the client Fisioterapia Ana and tell me if she has unpaid invoices."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Quipu (the connector)** is a community MCP over the Quipu API v1: with your API v1 credentials (App ID, App secret and your account slug), the agent reads your contacts (filterable by tax ID, kind or country), your invoices (free-text search and by period) and your book entries. It can also create contacts and income invoices, always asking for your confirmation first — every invoice lands in your book under Veri*Factu rules.
- **Overdue Invoice Chaser (the skill)** turns your overdue list into a message ladder: the friendly reminder (days 1–7 late), the firm follow-up with a deadline (weeks 2–4), and the final notice (past a month) — each with the invoice number, the amount, the due date and the days late. It asks for what's missing (prior contact, agreed terms) instead of inventing it, and never invents interest, fees or legal consequences that aren't in your terms.

**A real example:** *"Which of my invoices are unpaid? Draft the follow-up for each one."* The agent searches your Quipu invoices by period, the skill separates who gets the nudge and who gets the firm note, and drafts each message with the real amounts and dates. You review, adjust, and send each one yourself.

## How to use

1. Install the Plugin and connect Quipu with your API v1 credentials (Configuración → Integraciones → API v1 → Activar → Credenciales): the App ID, the App secret and your account slug — the one in your Quipu address, `getquipu.com/d/<slug>`.
2. Ask which invoices are unpaid. The agent reads them from your Quipu account instead of you typing the list by hand.
3. Give the skill what the invoice record doesn't show: what you already told that client and the payment terms you agreed on. It asks for what's missing instead of guessing.
4. Review each drafted message and send it from your own email — this pack doesn't send anything for you.

## Why the bundle works

The skill alone is a good writer working blind — its own steps say to check that the amount, number and dates match your actual invoice because "the AI can't see your invoicing system", so the overdue list would come from your memory. The connector alone sees the invoices, but the reminder it would produce is a generic draft. Together: collection starts from the real record (who owes, for how long, for how much) and each client gets the message that matches how late they are.

## Limits

- **Nothing sends automatically.** The connector has no email tool: the drafted ladder is the deliverable, and you send each message from your own mail.
- Creating invoices and contacts is a write with your explicit confirmation, and every invoice lands in your book under Veri*Factu rules — but creating records is not this pack's job: it reads your invoices and drafts the collection messages.
- The connector is a **TerminalSync community project, not built or endorsed by Quipu/TeamSystem**. Its writes were verified on 2026-10-27 against a real account (a contact and an income invoice created and read back). It does not cover simplified invoices, expense entries, paysheets, bank reconciliation or tax filings, and it deletes nothing.
- The skill never promises the client will pay and never threatens consequences that aren't in your terms. For a serious debt it's writing help — not a lawyer or a collection agency; it tells you when the case has reached that point.
- Quipu is focused on Spain (the connector is scoped to Spanish invoicing under Veri*Factu), so this pack fits a business that invoices Spanish clients.
