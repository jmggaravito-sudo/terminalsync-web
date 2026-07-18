---
name: Business Owner Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Track leads, send proposals, chase follow-ups, and watch the money — the sales-and-cash side of a small business in one place."
description: "A coherent bundle for the owner of a small business who does a bit of everything: keep leads and deals in one tracker, send professional proposals, follow up without dropping the ball, and see the money coming in — without wiring up a separate stack."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: stripe
    reason: "Shows the money: revenue, paid vs failed payments, customers, and refunds — so 'how are we doing?' has an answer without opening the dashboard."
  - kind: connector
    slug: airtable
    reason: "A lightweight tracker for leads, deals, and clients — the owner's CRM without a heavy CRM."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns a rough ask into a clean proposal, quote, or client document ready to send."
  - kind: skill
    slug: internal-comms
    reason: "Drafts the follow-up, the reminder, and the client update so deals don't stall in silence."
---
## Who it is for

The owner of a small business or a solo professional who does a bit of everything — sales, proposals, follow-ups, and keeping an eye on the money — and does not want to run (or pay for) a full sales stack to do it.

Use it when the same person chases the lead, writes the proposal, sends the follow-up, and wonders "did we actually get paid?".

## What it helps you do

This kit covers the client-and-money loop of a small business:

- Keep leads, deals, and clients in one simple tracker with Airtable.
- Turn a rough idea into a clean **proposal or quote** with Doc Co-authoring.
- Draft the **follow-up, reminder, or client update** with Internal Comms so nothing stalls.
- See the **money**: revenue, paid vs failed payments, customers, and refunds with Stripe.

The expected outcome is that the owner runs the sales-and-cash side of the business from one place, in plain language, without a CRM project or a finance tool to learn.

## What's included

### Connectors

- **Stripe** — reads revenue, payments (paid/failed), customers, and refunds, so "how are we doing this month?" gets a real answer.
- **Airtable** — a simple, flexible tracker for leads, deals, and client info — the owner's CRM without the CRM.

### Skills

- **Doc Co-authoring** — writes proposals, quotes, and client documents ready to send.
- **Internal Comms** — drafts follow-ups, reminders, and client updates in the right tone.

## How to use it

1. Install the kit, connect Stripe with its key, and connect Airtable with its token.
2. Ask *"which deals are still open?"* and keep them in an Airtable base.
3. Ask Doc Co-authoring to *"draft a proposal for this client based on these notes"*.
4. Ask Internal Comms to *"write a friendly follow-up for the proposal I sent Acme last week"*.
5. Ask *"how much did we bill this month, and were there any failed payments?"* — Stripe answers.

## Why these pieces belong together

The kit is coherent because it follows one loop, end to end:

- Airtable holds **who** the deals are with.
- Doc Co-authoring produces **what you send** them.
- Internal Comms keeps the deal **moving** with the right nudge.
- Stripe closes the loop with **the money that came in**.

Installed separately, the owner jumps between a spreadsheet, a doc editor, an email draft, and a payments dashboard. Installed together, it's one plain-language flow: **track the deal → send the proposal → follow up → see the money**. (It overlaps with the Docs & Team Comms kit on the two writing skills, but its purpose is different: that kit is for team documentation; this one is for the owner's sales and cash.)

## Limits

- It does not sell for you or make business decisions — it removes the busywork around them.
- It does not move money, issue refunds, or send messages on its own without you asking; it drafts and reports, you send and decide.
- Stripe and Airtable each need their own account and access token, and the kit only sees what those accounts allow.
- Stripe reflects what's in Stripe — cash, checks, or other processors are outside its view.
- It is a lightweight owner's kit, not a full CRM or accounting system — use it to stay on top of the day-to-day, not to replace your accountant.
