---
name: Square
logo: /connectors/square.svg
category: operations
status: available
tagline: "See who hasn't paid on Square — and send the reminder, in one product."
description: "Bundles the Square connector (payments, invoices, orders, and customers from your Square account) with Internal Comms (drafts the follow-up in the right tone), so 'who's overdue' turns into a ready-to-send reminder — with you approving before it sends."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: square
skillSlugs: ["internal-comms"]
---
## When to use

- You take payments through **Square** — in person, by invoice, or online — and want to see who hasn't paid without opening the dashboard.
- You want the follow-up message drafted for you, in a tone that's firm but courteous — not written from scratch every time.
- You want the AI to prepare the reminder but **you approve before it sends**.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Square (the connector)** reads your payments, invoices, orders, and customers straight from your Square account — the real picture of who paid and who hasn't.
- **Internal Comms (the skill)** drafts the payment follow-up in the right tone — firm but courteous — and flags when a case is sensitive enough to need human review instead of an automated nudge.

**A real example:** it's the middle of the month and you want to chase unpaid invoices before they get older. You ask *"which Square invoices are still unpaid, and draft a reminder for each customer?"*. Square lists the unpaid invoices with the amount and how overdue they are, Internal Comms drafts a distinct reminder for each customer referencing their invoice, and shows them to you. You review, tweak, approve, and send. What used to be scrolling the Square dashboard and writing each message by hand is a couple of minutes.

## How to use

1. Install the Plugin and connect Square with an access token (the manifest ships in **sandbox** mode by default — switch to production yourself once you're ready to work on your real account).
2. Ask: *"who hasn't paid this month?"*.
3. Ask *"draft a reminder for each"* — review the messages, **you approve**, and send them through whatever channel you use.

## Why the bundle works

Square alone shows you who hasn't paid, but then you have to write each reminder by hand — the part that gets put off. Internal Comms alone drafts messages, but doesn't know who owes you or how much. Together they close the loop: the AI reads the unpaid invoices, writes the reminder in the right tone, and leaves it ready — with your OK before anything sends.

## Limits

- **It doesn't move money**: it doesn't charge, refund, or send anything on its own without your approval — it reads the payments and drafts; you decide and send.
- Square's manifest defaults to **sandbox mode** — you won't see or touch your real customers' data until you switch it to production yourself.
- It reflects only what's logged in Square — cash, other processors, or in-person deals not entered into Square are outside its view.
- It doesn't replace your accountant or legal collections advice; for formal claims, get professional review.
- Requires connecting your Square account; it only sees what that access token allows.
