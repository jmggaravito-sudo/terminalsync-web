---
name: Inbox Paperwork Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Turn the invoices, contracts, and forms piling up in your inbox into structured records and sent replies — without the tab-switching."
description: "A coherent operations bundle for the owner or ops lead who runs paperwork by email: find the message, read the PDF attachment, produce the structured output (a running log, a filled draft, a cover note), and send the reply — one loop instead of an evening of copy-paste."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: gmail
    reason: "Holds the intake and the outbox — the messages and attachments the job actually runs on. Search finds the right thread among the noise, reading pulls the message in context, and send/forward closes the loop with every outbound action gated behind a confirmation step, so the agent drafts and you approve."
  - kind: connector
    slug: pdf
    reason: "Reads what the inbox actually delivers: supplier invoices, contracts, statements, and government forms arrive as PDF attachments, and this is the piece that opens them, searches pages, and extracts the text and figures — the step that used to mean opening each file by hand."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns what was extracted into the artifact the paperwork needs — a structured running log of what arrived and what's pending, a filled draft ready to send, or a cover note that travels with the document — kept consistent across revisions instead of retyped from scratch each time."
---
## Who it is for

An owner or operations lead of a small business that runs its paperwork by email: supplier invoices, client contracts, bank statements, government and platform forms. The recurring job this kit covers is the document loop — something lands in the inbox, someone has to know what it says, act on it, and answer.

Use it when the recurring pattern is *"another PDF arrived, and now I have to read it, log it, and reply"* — and the honest answer today is downloading the file, squinting at six pages, and retyping the same details into three places.

## What it helps you do

- **Find it**: search the inbox for the thread — the vendor's invoice, the client's contract revision — instead of scrolling.
- **Read it**: open the attached PDF and pull out the numbers, dates, terms, and blanks that actually matter.
- **Record it**: keep a structured running log — what arrived, from whom, for how much, what it needs next — so *"did we get that?"* has an answer that isn't memory.
- **Answer it**: a reply, forward, or cover note that carries the extracted details — sent from your own account, gated behind a confirmation before anything leaves.

The expected outcome: the daily paperwork drip stops being an evening of tab-switching and becomes one repeatable loop — **find → read → record → answer.**

## What's included

### Connectors

- **Gmail** — the intake and the outbox. Reads and searches your messages and threads, and sends or forwards the reply. Every send, forward, modify, and archive action is gated behind a confirmation step: the agent drafts and decides the wording with you, but nothing leaves the outbox until you approve it.
- **PDF** — the reader for the attachments. Opens the PDF documents you point it at, searches inside them, extracts text and figures, and annotates or saves with explicit save gates — so the invoice's total, the contract's term, and the form's blanks become text the agent can work with.

### Skills

- **Doc Co-Authoring** — the structured output. Guides the running log or the cover note through brief → outline → draft → revision, keeping names, numbers, and pending items consistent across rounds, so month over month you're extending one living record instead of starting a new scratch file every week.

## How to use it

1. Install the kit and connect Gmail with your Google account (OAuth credentials set up once, per the connector page's steps). Your Gmail permissions bound what the agent can see and do.
2. First pass of the morning: *"Find the invoices that arrived this week from [vendor] and tell me what each one is for."*
3. Work one document: *"Open the PDF from that message, pull the invoice number, total, and due date, and add a line to the running log."*
4. Close the loop: *"Draft a reply confirming we received it, and flag the one line item that doesn't match the order."* Review the draft, approve the send, done.
5. Keep the log as the artifact: one document per month showing what arrived, what's pending, and what was answered — the thing you open the next time someone asks *"did the landlord ever send the updated lease?"*

## Why these pieces belong together

The kit follows the real loop of email paperwork, not a pile of office tools:

- Gmail holds **where the job starts and ends** — the message that arrives and the reply that leaves, with the confirmation gate in between.
- PDF is **what the job actually reads** — because the paperwork itself arrives as attachments, not as email text; without it the loop stops at "there's an attachment."
- Doc Co-Authoring turns what was extracted into **the record and the answer** — a log that persists and drafts that hold their structure across revisions.

Installed separately, the search lives in one tab, the PDF in another, and the write-up gets retyped every time. Installed together, one path covers the loop: **find the message → read the attachment → record it → send the answer.**

It shares Doc Co-Authoring with the finance and comms kits, but the ground is different: Bookkeeping & Tax Handoff assembles the accountant packet from the books, and Small Business Finance reads Xero and Stripe. This kit runs on the inbox itself — the documents that arrive *before* they reach any system of record, and often never do.

## Limits

- **It requires Gmail.** If your business mail runs on Outlook, Zoho, or a shared helpdesk, the anchor connector doesn't apply — there is no equivalent anchor for another mail platform in this kit.
- **Setup is OAuth, not one click**: the connector needs Google OAuth client credentials during setup (the connector page has the exact steps); this is the connector's own requirement, stated up front.
- **Save the attachment first.** The PDF connector reads documents you point it at (local files or approved paths); it does not fetch attachments out of Gmail by itself — the workflow is "save the file, then have it read."
- **It reads and drafts; it doesn't file or pay.** No bookkeeping entries, no tax positions, no payments — the extracted numbers go into your log or your reply, and the books stay in your accounting system.
- **It is not a support inbox.** No ticketing, no customer-service queue, no reply-at-scale workflow — for customer-facing support you need a helpdesk connector, not this kit.
- **Sensitive documents deserve care**: contracts, payslips, and statements are private. The agent sees what the connected account can see, so connect an account whose scope you accept, and keep confirmation gates on for anything outbound.
