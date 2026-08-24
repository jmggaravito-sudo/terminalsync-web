---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Your payroll numbers, already pulled — plugged into your tax-season checklist."
description: "Bundles the Gusto connector (read-only employees, contractors, pay schedules, and payroll data from your Gusto account) with Tax Prep Checklist (turns entity type, states, employees, and contractors into a personalized document checklist), so 'what do I need before tax season' starts from your real payroll numbers instead of a guess."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["tax-prep-checklist"]
---
## When to use

- You run payroll through **Gusto** and want to walk into tax season with your actual headcount, states, and contractor payments already pulled — not typed in from memory.
- You said "what do I need to file my business taxes this year" and want the intake (do you have employees, which states, did you pay contractors) answered from your own payroll data.
- You want the "chase the missing W-9s" and payroll-tax-filing reminders to reflect who you actually paid this year, not a generic list.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Gusto (the connector)** reads your employee roster and their work states, your contractor list and what they were paid, and your pay schedule — read-only, straight from your Gusto account.
- **Tax Prep Checklist (the skill)** turns that into a personalized document checklist: which entity-specific items apply, whether payroll tax filings belong on the list, and — since you have contractors — the explicit reminder to chase any missing W-9 before the deadline.

**A real example:** it's November and you want to get ahead of your accountant meeting. You ask *"what do I need for taxes this year, based on my Gusto account?"*. Gusto reports you have 4 employees across two states and paid 3 contractors this year, Tax Prep Checklist uses that to include payroll tax filings on the list and names the W-9 check for each of the 3 contractors — flagging anything it can't confirm (like which contractors already have a W-9 on file, since Gusto doesn't track that) as an open question for your accountant.

## How to use

1. Install the Plugin and connect **Gusto** — a browser window opens for you to sign in and approve which data categories to share (Company, Employee, Contractor, Payroll).
2. Ask: *"what do I need to prep for taxes this year?"* — mention your entity type if the skill doesn't already have it.
3. Review the checklist, and take anything flagged "ask your accountant" to that conversation as your agenda.

## Why the bundle works

Tax Prep Checklist alone has to ask you for headcount, states, and contractor counts by hand — the kind of thing that's easy to get wrong from memory in November. Gusto alone reports payroll data but doesn't know what a tax-document checklist needs from it. Together, the connector answers the intake questions from your real payroll account, and the skill turns that into the categorized list — without ever calculating what you owe or replacing your CPA.

## Limits

- Gusto is **read-only**: this Plugin can't run payroll, edit an employee, or check a W-9 on file — Gusto's own tools don't expose W-9 status, so that check still needs your own records or your contractor.
- It never tells you what you owe, which forms to file, or how to classify a borderline worker — those go to a CPA/EA or IRS.gov, same as the skill alone.
- Reflects only what's in Gusto — income, expenses, and bank data live elsewhere and aren't part of this Plugin.
- Requires connecting your Gusto account via OAuth; it only sees the data categories you approve.
