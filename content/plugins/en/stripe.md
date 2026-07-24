---
name: Stripe
logo: /connectors/stripe.svg
category: operations
status: available
tagline: "See who hasn't paid and send the reminder — the money and the message, together."
description: "Bundles the Stripe connector (billing, payments, customers, refunds) with Internal Comms (drafts the friendly payment reminder), to go from 'who owes me' to 'already messaged them' without switching tools — with you approving before it sends."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: stripe
skillSlugs: ["internal-comms"]
---
## When to use

- You want to see **who hasn't paid** (failed payments, overdue invoices) and send them a reminder, without exporting spreadsheets or writing each message by hand.
- You run collections for a small business yourself and want the repetitive follow-up off your plate.
- You want the AI to prepare the reminder but **you approve before it goes out**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Stripe (the connector)** reads billing, payments (ok/failed), customers, and refunds — the real picture of your cash, without opening the dashboard.
- **Internal Comms (the skill)** drafts the payment reminder in the right tone — firm but courteous — and states its limits (sensitive or legal matters go through human review).

**A real example:** it's month-end and you want to close out receivables. You say *"which customers have failed payments or overdue invoices this month, and draft a friendly reminder for each?"*. Stripe lists the three customers with the amount and days overdue, Internal Comms builds a distinct reminder for each referencing the invoice, and shows them to you. You review, tweak, approve, and they go. What was an hour of spreadsheet + awkward writing is five minutes.

## How to use

1. Install the Plugin and connect Stripe with its key.
2. Ask: *"who has overdue payments this month?"* and then *"draft a reminder for each"*.
3. Review the messages — **you approve** — and send them (through whatever channel you use).

## Why the bundle works

Stripe alone shows you the numbers, but then you have to write each reminder by hand — the awkward part that gets put off. Internal Comms alone drafts, but doesn't know who owes you. Together they close the collections loop: the AI sees who hasn't paid, writes the message in the right tone, and leaves it ready — from "who owes me" to "already messaged them", with your OK in the middle.

## Limits

- **It doesn't move money**: it doesn't charge, refund, or send on its own without your approval — it reads the cash and drafts; you decide and send.
- Stripe reflects only what's in Stripe — cash, checks, or other processors are outside its view.
- It doesn't replace your accountant or legal collections advice; for formal claims, get professional review.
- Requires connecting your Stripe account; it only sees what that account allows.
