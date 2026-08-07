---
name: Small Business Finance Kit
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Read the books, reconcile the online payments, and get a written monthly financial summary — without opening a single report builder."
description: "A coherent finance bundle for a small-business owner or bookkeeper who keeps the books in Xero and takes online payments through Stripe: see who owes money, what's overdue, how last month actually went, and get it written up as a plain-language summary."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: xero
    reason: "Reads the actual books: invoices, aged receivables, P&L, and balance sheet, so 'who owes us?' and 'how did last month go?' have real answers instead of a guess."
  - kind: connector
    slug: stripe
    reason: "Reads online payments, customers, and refunds, so the online-checkout side of the business can be checked against what Xero shows in the books."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the numbers from Xero and Stripe into a structured, written monthly financial summary a non-accountant stakeholder can actually read."
---
## Who it is for

The owner of a small business, or the bookkeeper working for one, who keeps the books in Xero and takes online payments through Stripe, and needs to answer "who owes us money?", "what's overdue?", and "how did we actually do last month?" without building a report by hand every time.

Use it when the recurring job is reading the numbers and writing them up, not doing the bookkeeping itself — this kit reads and drafts, it does not replace an accountant.

## What it helps you do

This kit covers the read-the-numbers-and-write-it-up loop of small-business finance:

- See **who owes money and what's overdue** by reading aged receivables and unpaid invoices in Xero.
- See **how last month went**, reading the P&L and balance sheet straight from Xero.
- See the **online-payments side**: revenue, paid vs failed charges, customers, and refunds in Stripe.
- Turn the combined picture into a **written monthly summary** with Doc Co-authoring — one document instead of two dashboards and a mental note to write it up later.

The expected outcome is a short, sourced financial summary the owner can read or hand to a partner/investor, grounded in the actual books and actual online payments.

## What's included

### Connectors

- **Xero** — reads invoices, aged receivables, payments, contacts, and reports (P&L, balance sheet, trial balance) straight from the company's books; it can also draft an invoice or quote for review, never sending or finalizing anything on its own.
- **Stripe** — reads revenue, payments (paid vs failed), customers, and refunds from the online-checkout side of the business, so it can be checked against what's recorded in Xero.

### Skills

- **Doc Co-authoring** — turns the numbers pulled from Xero and Stripe into a structured written report: what changed, what's overdue, what to watch, with the reasoning a reader can follow instead of a wall of exported numbers.

## How to use it

1. Install the kit, connect Xero through a Custom Connection (Client ID + Client Secret), and connect Stripe with its key.
2. Ask *"who owes us money and how much, and what's overdue?"* — Xero answers with aged receivables.
3. Ask *"how did we do last month?"* to get the P&L, and *"what's our position right now?"* for the balance sheet.
4. Ask *"were there any failed payments or refunds on Stripe this month?"* to check the online side.
5. Ask Doc Co-authoring to *"write this up as a short monthly financial summary I can send to my partner"* using the numbers above.

## Why these pieces belong together

The kit is coherent because it separates what the business needs from a financial check-in:

- Xero supplies **the books** — invoices, receivables, and the official P&L/balance sheet.
- Stripe supplies **the online-payments layer**, checked against what's recorded in the books.
- Doc Co-authoring supplies **the write-up** — a summary a non-accountant can actually read, not a spreadsheet export.

Installed separately, the owner reads two dashboards and still has to write the summary by hand every month. Installed together, the kit gives one path: **read the books → check it against online payments → write the summary**.

It overlaps with the Business Owner Kit on Stripe and Doc Co-authoring, but the purpose is different: the Business Owner Kit is a lightweight Airtable-based sales-and-cash tracker for a solo owner doing a bit of everything; this kit is for the actual accounting — invoices, receivables, and P&L in Xero — for whoever handles the books.

## Limits

- It does not do the bookkeeping, file taxes, or replace an accountant — it reads what's already in Xero and Stripe and helps write it up.
- It does not send invoices, move money, or issue refunds on its own; Xero writes (invoices, payments, contacts) and Stripe actions require your review and confirmation.
- Xero's Custom Connection needs a paid Xero plan and its own one-time developer-portal setup; Stripe needs its own account and API key.
- It only sees what's recorded in Xero and Stripe — cash, checks, or a different accounting/payments platform are outside its view.
- If your business runs on Alegra, Siigo, QuickBooks, or another platform instead of Xero, this kit does not cover it yet; many "invoices and budget" questions can work through the Google Sheets connector if you track them in a spreadsheet.
