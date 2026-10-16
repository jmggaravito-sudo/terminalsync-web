---
name: Spend Review Kit
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "See where the money actually went, clear the pending approvals, and close each month with a spend memo the team actually reads."
description: "A coherent finance bundle for the owner, finance lead, or office manager who runs company spend on Ramp corporate cards: pull the real transactions instead of guessing, decide what's pending, lock what's off, write the review down, and tell the team what changed."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: ramp
    reason: "Holds the real spend ledger and the levers a review ends in — transactions, top vendors, what's missing receipts, pending reimbursements and requests, card balances, plus the actions themselves (approve, reject, lock a card) — so the review runs on what actually happened, not on what someone remembers spending."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns those answers into the recurring artifact of the job — a monthly spend review memo with structure, decisions, and open questions kept across drafts — instead of chat answers that evaporate when the window closes and next month starts from zero."
  - kind: skill
    slug: internal-comms
    reason: "Delivers the decisions to the people they bind — a new receipt rule, tighter card limits, a locked card — as a team-facing message with audience, tone, and what-changes-for-you, instead of forwarding the memo nobody reads."
---
## Who it is for

An owner, finance lead, or office manager of a small or mid-size business that runs its spending on Ramp — corporate cards, reimbursements, and expense policies. The recurring job this kit covers is the spend review: the weekly check and the monthly close on where the money went.

Use it when the recurring questions are *"where did the money go this month?"*, *"what's still waiting for approval?"*, and *"who owes receipts?"* — and the honest answer today is scrolling Ramp reports line by line or guessing from the bank statement.

## What it helps you do

This kit covers the loop of a spend review, from the questions to the decisions to the people affected by them:

- **See it**: top vendors by spend, transactions missing receipts or memos, pending reimbursements and requests, card balances — pulled from the real ledger.
- **Decide it**: approve or reject pending transactions, reimbursements, and requests with a reason, and lock a card that's off-policy or lost.
- **Record it**: a monthly spend review memo — where the money went, what changed, what to watch — that survives past the chat window.
- **Communicate it**: when a review changes a rule, the team hears it as a clear policy update, not as silence followed by a declined card.

The expected outcome: the spend review stops being a quarterly fire drill and becomes a repeatable loop — **see → decide → record → communicate.**

## What's included

### Connectors

- **Ramp** — the spend ledger and the levers. Reads your transactions, top vendors, missing receipts, pending reimbursements and requests, card balances, and spend limits; and takes the routine actions a review ends in — approvals, rejections, card locks — bounded by your own Ramp role. It connects with your Ramp login in the browser; no API key to paste.

### Skills

- **Doc Co-Authoring** — the review artifact. Guides the monthly spend memo through brief → outline → draft → revision, keeping decisions, numbers, and open questions consistent across rounds, so month over month you're refining one living document instead of rewriting from scratch.
- **Internal Comms** — the team-facing half. Drafts the policy update or spend-review outcome your people need to hear — what changes, what doesn't, what each person has to do, and where to ask — with the tone calibrated instead of corporate-vague.

## How to use it

1. Install the kit and connect Ramp with your own account — a browser login, no API key. Your Ramp permissions travel with the connection: admins see company-wide data, employees see their own.
2. First look at the month: *"Show me our top software vendors by spend this quarter."* Then the hygiene pass: *"Find transactions with missing receipts or memos in the last 14 days."*
3. Clear the queue: *"Pull pending reimbursements and requests for this week's review"* and decide each one — approvals are gated behind a confirmation step before anything is written.
4. Close the month: ask Doc Co-Authoring for the spend review memo — where the money went, what you decided, what to watch next month — building on last month's memo instead of starting over.
5. When the review changes a rule — receipts now due within 14 days, a lower limit on a card — ask Internal Comms for the update, and share it where your team reads before the first declined card teaches them the hard way.

## Why these pieces belong together

The kit follows the real loop of a spend review, not a pile of finance tools:

- Ramp holds **what actually happened** — the transactions, vendors, receipts, and pending approvals — and carries the actions the review ends in.
- Doc Co-Authoring turns the answers into **the record** — a memo with structure that survives the month.
- Internal Comms makes the decisions **reach the team** — a policy people understand instead of surprise declines.

Installed separately, you get accurate answers in a chat window that close and vanish; the approvals queue stays in Ramp; and the team finds out about the new receipt rule when a card gets declined. Installed together, one path covers the loop: **read the ledger → decide the pending → write the memo → brief the team.**

It shares its two skills with the other finance kits, but the ground is different: Small Business Finance reads the books (Xero + Stripe) and writes the monthly financial summary the owner reads; Bookkeeping & Tax Handoff assembles the packet for the accountant. This kit runs one layer below the books — on the corporate-card and reimbursement layer where money actually leaves — and it ends in actions (approvals, locks) and a team policy brief, not an accounting artifact.

## Limits

- **It requires Ramp.** If your cards, reimbursements, and spend policies don't run on Ramp, there is nothing to connect; this kit has no equivalent anchor for another spend platform.
- **It is not bookkeeping.** No ledger, no reconciliation, no tax prep — for the monthly financial summary or the accountant handoff packet, use those kits instead. Ramp's own books stay the source of truth.
- **Two actions stay inside Ramp's app**: bill approvals are not available through MCP, and receipt files can't be attached through it — you approve bills and attach receipts in Ramp directly.
- **Ramp MCP is hosted by Ramp** and can both read and write (approvals, card locks, accounting coding). What the agent can see or do is bounded by your own Ramp role; admins control who can connect at all (Company → Integrations → Ramp MCP → Manage access). Ramp states its MCP is subject to change, with new tools added regularly.
- **Big pulls need narrowing**: queries that would return more than 100 rows come back empty until you scope the request (by month, vendor, or card).
- **It reports and enforces policy; it doesn't write it.** The limits, programs, and receipt rules it checks are the ones you set in Ramp — deciding what the policy should be is still the owner's call.
