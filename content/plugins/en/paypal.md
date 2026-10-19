---
name: PayPal
logo: /plugins/paypal.svg
category: operations
status: available
tagline: "See which invoices are actually overdue, and send the chase each one deserves."
description: "Bundles the PayPal connector (official PayPal MCP: your invoices, payments, subscriptions and transaction reports over OAuth) with Overdue Invoice Chaser (turns an overdue list into a reminder → firm follow-up → final notice ladder, within your terms), so chasing what you're owed starts from the invoice record — how late it is, what you already said — instead of from memory."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: paypal
skillSlugs: ["cobros-vencidos"]
---
## When to use

- You bill clients through PayPal invoices and chasing late payers lives in your head: who's late, since when, and what you already told them last time.
- You want the follow-up to escalate in steps that match how late each client is — a nudge first, a firm note later, a final notice last — instead of one angry email for everyone.
- PayPal's own connector documentation uses this exact job as its example: *"Which invoices are still unpaid? Send a reminder to the client who's late."*

## What it does

Bundles two pieces that reinforce each other, in one install:

- **PayPal (the connector)** is the official hosted PayPal MCP: with your own PayPal login (no API key to paste), the agent reads your invoices (`list_invoices`, `get_invoice`), their payments and your transactions, and can send an invoice or send its reminder (`send_invoice`, `send_invoice_reminder`) on the invoice you name.
- **Overdue Invoice Chaser (the skill)** turns your overdue list into a message ladder: the friendly reminder, the firm follow-up, the final notice — each carrying the invoice number, the amount, the due date and the days late. It asks for what's missing (prior contact, agreed terms) instead of inventing it, and it never invents interest, fees or legal consequences beyond the terms you gave it.

**A real example:** *"Which of my invoices are overdue? Draft the follow-up for each."* The agent pulls the overdue ones from your PayPal account, the skill sorts who gets the nudge and who gets the firm note, and drafts each message with the real amounts and dates. You send them — or ask the agent to send the reminder on one specific invoice, and confirm before it goes.

## How to use

1. Install the Plugin and connect PayPal — no API key; you log in with your own account.
2. Ask which invoices are overdue. The agent reads them from your account instead of you typing the list by hand.
3. Give the skill what the invoice record can't show: what you already told this client, and the payment terms you agreed. It asks for what's missing rather than guessing.
4. Review each drafted message and send it yourself — or, for a specific invoice, ask the agent to send the reminder and confirm before it goes out.

## Why the bundle works

The skill alone is a good writer working blind — its own body says "the AI can't see your invoicing system", so the overdue list arrives from your memory. The connector alone can see the invoices, but the reminder it sends is a generic one. Together: the chase starts from the real record (who's late, how late, for how much) and each client gets the message that matches their stage of late.

## Limits

- Sending is a real action: `send_invoice` and `send_invoice_reminder` go out for real, and PayPal's MCP documentation doesn't declare a per-action confirmation step — so treat "send it" as a decision you make per invoice, and review before confirming.
- The connector knows the invoice record, not your relationship: prior contact and agreed terms come from you, and the skill asks instead of filling the gap with something plausible.
- The skill never promises the client will pay, and it won't threaten consequences that aren't in your terms. For serious debt it's a drafting aid — not a lawyer or a collection agency.
- This pack reads invoices and drafts or sends reminders. The connector has other write tools (refunds, dispute claims, subscriptions) that are not part of this job.
- This is a server hosted by PayPal (`mcp.paypal.com`), not something on your computer: what the agent can see and do is bounded by the account you connect.
