---
name: Xero
logo: /connectors/xero.svg
category: operations
status: available
tagline: "Know what's overdue and chase it — the books and the reminder, together."
description: "Bundles the Xero connector (invoices, aged receivables, payments, P&L, balance sheet) with Internal Comms (drafts the payment reminder in the right tone), so a small business owner can go from 'who owes me' to 'already followed up' without opening Xero or writing the email by hand."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: xero
skillSlugs: ["internal-comms"]
---
## When to use

- You keep your books in **Xero** and want to know **who owes you money, what's overdue, and how the business did last month** without opening the dashboard or building a report.
- You want the follow-up reminder for an overdue invoice **drafted for you**, in a tone that's firm but courteous — not written from scratch each time.
- You want the AI to prepare the reminder but **you approve before it goes out**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Xero (the connector)** reads your invoices, aged receivables, payments, contacts, and reports (P&L, balance sheet, trial balance) — the real state of your books, in plain words.
- **Internal Comms (the skill)** drafts the payment reminder in the right tone — firm but courteous — and flags when a case is sensitive enough to need human review instead of an automated nudge.

**A real example:** it's the end of the month and you want to close out receivables before running payroll. You ask *"which invoices are overdue, and draft a reminder for each client?"*. Xero lists the overdue invoices with the amount and days late, Internal Comms drafts a distinct reminder for each client referencing their invoice, and shows them to you. You review, tweak, approve, and send. What used to be exporting a report and writing three awkward emails is five minutes.

## How to use

1. Install the Plugin and connect Xero with a Custom Connection (Client ID + Secret from your Xero developer account).
2. Ask: *"who owes me money and what's overdue?"* or *"how did we do last month?"*.
3. Ask *"draft a reminder for each overdue invoice"* — review the messages, **you approve**, and send them through whatever channel you use.

## Why the bundle works

Xero alone shows you the numbers, but then you have to write each reminder by hand — the part that gets put off until it's genuinely late. Internal Comms alone drafts messages, but doesn't know who owes you or by how much. Together they close the loop: the AI reads the books, writes the reminder in the right tone, and leaves it ready — with your OK before anything sends.

## Limits

- **It doesn't move money or file anything**: it doesn't record payments, e-file taxes, or send reminders on its own — it reads the books and drafts; you decide and send.
- It reflects only what's in Xero — cash, other processors, or off-books transactions are outside its view.
- **This Plugin is not a tax-filing tool.** It does not prepare or file 1099s, W-9s, W-2s, or payroll tax filings, and it does not connect to QuickBooks, Odoo, or TaxBandits — none of those has an official, installable connector in the catalog today.
- It doesn't replace your accountant; for filings and formal tax positions, get professional review.
- Requires connecting your Xero account; it only sees what that account's Custom Connection allows.
