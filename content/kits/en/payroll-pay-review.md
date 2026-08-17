---
name: Payroll & Team Pay Review Kit
logo: /logos/ts-kit.svg
category: finance
status: available
tagline: "Check payroll before you approve it, and tell the team what changed — without digging through Gusto tabs."
description: "A coherent payroll workflow bundle for the small-business owner running payroll on Gusto: review headcount and cost changes before approving a pay run, turn them into a short review note, and draft the team-facing message when pay actually changes."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: gusto
    reason: "Reads the real roster, contractor list, upcoming pay period, and payroll-tax/deduction info straight from Gusto — read-only, so the owner sees what's about to run before approving it inside Gusto."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the raw Gusto data (new hires, terminations, contractor changes, pay period cost) into a short structured pre-approval review note instead of the owner cross-checking tabs from memory."
  - kind: skill
    slug: internal-comms
    reason: "Drafts the team-facing message when a pay-related change actually needs announcing — a raise effective date, a new benefit, a payroll correction — with the sensitive-comp-topic review flag Internal Comms already builds in."
---
## Who it is for

Small-business owners, or whoever runs payroll on a small team (often the owner), who process payroll through Gusto and want to catch what changed — a new hire, a termination, a contractor added or dropped, a cost jump — before approving a run, and who need to tell the team when pay actually changes.

Use it when the recurring job is "review this pay run before I hit approve" and "let the team know what changed", not running payroll itself.

## What it helps you do

- Ask Gusto plain questions before approving payroll: *"who's new since last pay period?"*, *"did anyone get terminated?"*, *"what's this run going to cost?"*, *"what did we pay contractors last month?"*
- Turn that read-only data into a short pre-approval review note with Doc Co-authoring: headcount changes, cost delta, open items to double-check.
- When a pay-related change needs a team announcement — a raise, a new benefit enrollment window, a payroll correction — draft it with Internal Comms, which flags when the topic needs HR/legal eyes before it goes out.
- Expected outcome: the owner approves payroll (inside Gusto — this kit doesn't do that part) with a clear picture of what changed, and the team hears about pay changes in a clear message instead of secondhand or not at all.

## What's included

### Connectors

- **Gusto** — read-only across Company & Organization, Employees, Contractors, Payroll, and Time Tracking. It answers "what changed" and "what's this going to cost" without the owner clicking through Gusto's own tabs, and it can't run payroll or edit a record itself — every approval still happens inside Gusto.

### Skills

- **Doc Co-authoring** — structures the Gusto data plus the owner's own notes ("this new hire is a contractor-to-FTE conversion", "this termination was involuntary, HR already signed off") into a short review note before a pay run is approved.
- **Internal Comms** — drafts the team-facing message when pay changes. Compensation, benefits, and policy updates are explicitly in its own stated scope, and it flags when a draft needs HR/legal review before sending — which matters for anything pay-related.

### CLI

No CLI tool is included. The workflow is read payroll data, write a review note, and draft an announcement — none of it needs terminal-level execution.

## How to use it

1. Install the kit and connect Gusto (OAuth login; choose which data categories to share — Company Information, Employee Data, Contractor Data, Payroll Data, Time Tracking).
2. A few days before a scheduled pay run, ask *"who's changed since the last pay period — new hires, terminations, contractor changes?"* and *"what's this payroll going to cost?"*
3. Ask Doc Co-authoring to *"build a short pre-approval review note: headcount changes, cost vs. last run, and anything I should double-check before I approve."*
4. Add the context Gusto's data can't carry on its own — why a termination happened, whether a cost jump was expected — so the note doesn't read like a bare data dump.
5. When a pay-related change needs a team announcement, ask Internal Comms to *"draft the message about [the raise / new benefit / correction], and flag anything that needs HR or legal review first."*
6. Approve the actual pay run inside Gusto — this kit never does that step for you.

## Why these pieces belong together

The kit is coherent because it follows one loop: **see what's changing → review it before approving → tell the team when it matters.**

- Gusto is the only piece that can see the real payroll data — without it, "review before approving" means the owner recalling roster changes from memory or clicking through Gusto's UI by hand.
- Doc Co-authoring turns that raw, read-only data into something the owner can act on in two minutes instead of open tabs and mental math.
- Internal Comms closes the loop toward the team: it explicitly lists compensation, benefits, and policy changes in its own scope, and builds in the "does this need HR/legal review" flag that a pay-related message specifically needs. (This kit shares Doc Co-authoring + Internal Comms with the Bookkeeping & Tax Handoff Kit and the Business Owner Kit — same two building-block skills, different workflow: those turn numbers into an accountant packet or a client proposal; this one turns Gusto's payroll data into a pre-approval review note and a team-facing pay announcement.)
- It's also a finance kit that doesn't overlap the catalog's Xero-based finance kits: Bookkeeping & Tax Handoff and Small Business Finance both read Xero's general books; this kit reads Gusto's payroll/HR data specifically — most small businesses run payroll and bookkeeping as separate systems, so a Gusto customer can install this alongside either Xero kit without duplication.

Installed separately, the owner cross-checks Gusto's tabs by memory before approving, and writes the team announcement from a blank page every time. Installed together, it's one flow from "what changed this pay period" to "the team knows, and I approved it with eyes open."

## Limits

- It's built entirely on Gusto's read-only tools: it cannot run payroll, approve a pay run, edit an employee or contractor record, or change compensation. Every one of those actions still happens inside Gusto directly.
- It doesn't calculate or file payroll tax forms (941, state withholding, W-2) or generate/e-file 1099s — no catalog connector or skill does that today; see the Bookkeeping & Tax Handoff Kit's own Limits for the same gap on the bookkeeping side.
- It only sees what the owner grants Gusto access to at connection time (Company Information, Employee Data, Contractor Data, Payroll Data, Time Tracking are each opt-in) — anything not shared stays invisible to the kit.
- For layoffs, compensation changes, benefits, or other sensitive HR topics, Internal Comms drafts a starting point and explicitly flags the need for HR/legal review before anything goes out — it does not replace that review.
- It doesn't send anything on its own — it drafts the review note and the announcement; the owner reviews, approves payroll in Gusto, and sends the message.
