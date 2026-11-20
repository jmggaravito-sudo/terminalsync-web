---
name: Holded
logo: /plugins/holded.svg
category: operations
status: available
tagline: "See which invoices are unpaid straight from your Holded account, and send the chase each one deserves."
description: "Bundles the Holded connector (official Holded MCP: invoicing, accounting, CRM and inventory over your own login) with Overdue Invoice Chaser (turns an overdue list into a reminder → firm follow-up → final notice ladder, within your terms), so the chase starts from the real invoice record instead of your memory."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: holded
skillSlugs: ["cobros-vencidos"]
---
## When to use

- You run your day-to-day on Holded and unpaid invoices pile up while you put off the awkward message: who owes, since when, and for how much.
- You want the follow-up to escalate in steps that match how late each client is — a nudge first, a firm note later, a final notice last — instead of one angry email for everyone.
- Holded's own connector documentation uses this exact job as its example: *"Show me this month's unpaid invoices and what the total adds up to."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Holded (the connector)** is the official hosted Holded MCP: with your own account login (no API key to paste), the agent reads your invoices, contacts, products and stock straight from your account, and can draft operational documents (quotes, pro forma invoices, contacts) when you approve each action.
- **Overdue Invoice Chaser (the skill)** turns your overdue list into a message ladder: the friendly reminder (days 1–7 late), the firm follow-up with a deadline (weeks 2–4), and the final notice (past a month) — each carrying the invoice number, the amount, the due date and the days late. It asks for what's missing (prior contact, agreed terms) instead of inventing it, and never invents interest, fees or legal consequences beyond the terms you gave it.

**A real example:** *"Which invoices are unpaid this month? Draft the follow-up for each."* The agent pulls the unpaid ones from your Holded account, the skill separates who gets the nudge and who gets the firm note, and drafts each message with the real amounts and dates.

## How to use

1. Install the Plugin and connect Holded — no API key; you log in with your own account.
2. Ask which invoices are overdue. The agent reads them from your account instead of you typing the list by hand.
3. Give the skill what the invoice record can't show: what you already told this client, and the payment terms you agreed. It asks for what's missing rather than guessing.
4. Review each drafted message and send it from your own email, where your relationship with the client actually lives.

## Why the bundle works

The skill alone is a good writer working blind — its own body says "the AI can't see your invoicing system", so the overdue list arrives from your memory. The connector alone can see the invoices, but the summary it returns is a generic one. Together: the chase starts from the real record (who's late, how late, for how much) and each client gets the message that matches their stage of late — the check the skill asks for ("amount, number, and dates match your actual invoice") is already done by the read.

## Limits

- This pack reads invoices; it does not send messages from Holded. Invoices are read-only under Holded's recommended permission profiles (the preselected Analytical profile is enough for this job), and the drafted messages go out from your own email.
- Your account needs API access — Holded's API is available on paid plans, not on the Free plan.
- The connector knows the invoice record, not your relationship: prior contact and agreed terms come from you, and the skill asks instead of filling the gap with something plausible.
- The skill never promises the client will pay, and it won't threaten consequences that aren't in your terms. For serious debt it's a drafting aid — not a lawyer or a collection agency.
- This is a server hosted by Holded (`mcp.holded.com`), not something on your computer: what the agent can see and do is bounded by the account and permission profile you connect. This job uses the read side only — accounting, payroll and Team/HR areas are not part of it.
