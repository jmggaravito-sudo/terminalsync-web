---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Your real payroll picture, turned straight into your tax-season checklist."
description: "Bundles the Gusto connector (read-only employee, contractor, and payroll data from your account) with Tax Prep Checklist (builds a personalized document checklist by entity type, state, and staffing), so the checklist's questions about employees, contractors, and payroll reports get answered from your real Gusto data instead of a guess."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["tax-prep-checklist"]
---
## When to use

- You run payroll through **Gusto** and want to walk into tax season with a personalized document checklist instead of a generic list you have to adapt yourself.
- You're not sure exactly who counted as an employee vs. contractor this year, or whether anything changed (a new hire, a termination, a new work location) that adds to what you need to gather.
- You want the checklist's "ask your accountant" flags to be grounded in your actual roster and payment history, not a guess about whether you even have employees.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Gusto (the connector)** reads your company's roster, contractor list and payment history, pay schedules, and payroll runs directly from your account — read-only, it cannot run payroll, move money, or change a record.
- **Tax Prep Checklist (the skill)** turns entity type, state, staffing, and what changed this year into a categorized document checklist — income documents, expense documents, entity-specific items, and open flags for your accountant — without ever estimating what you owe.

**A real example:** it's January and you want to get ahead of tax season. You ask *"build my tax prep checklist — pull my employee and contractor info from Gusto first."* Gusto reports you have 4 W-2 employees across two states and paid 3 contractors last year, plus a termination in September. Tax Prep Checklist uses that to build the exact checklist for your situation — payroll tax filings for both states, W-9s to confirm for each contractor before the 1099-NEC deadline, and a flag about the September termination for your accountant — instead of asking you to answer those questions from memory.

## How to use

1. Install the Plugin and connect your Gusto account (sign in with Gusto, then choose which data categories to share — Company, Employee, Contractor, Payroll, Time Tracking).
2. Ask: *"build my business tax prep checklist using my Gusto data."*
3. Answer any remaining intake questions the checklist needs that Gusto doesn't cover (your entity type, the states you operate in beyond payroll, non-payroll income sources).
4. Use the categorized checklist — and the "ask your accountant" flags — as your gathering list and your agenda for the handoff call.

## Why the bundle works

Tax Prep Checklist alone has to ask you whether you have employees, whether you paid contractors, and whether anything changed this year — questions you might answer from memory and get wrong. Gusto alone gives you the raw roster and payment data, but doesn't turn it into a document checklist or tell you what an accountant will ask for. Together: the AI reads your actual payroll data first, then builds the checklist branch that matches your real situation — fewer guessed answers, and the W-9-before-1099-deadline flag lands on contractors Gusto actually shows you paid.

## Limits

- **Gusto is read-only.** It cannot run payroll, move money, or create/edit/delete an employee record — for anything beyond looking things up, you still work inside Gusto directly.
- **This Plugin does not calculate what you owe, prepare a filing, or interpret tax law for your situation.** Tax Prep Checklist only organizes documents and data; borderline calls (worker vs. contractor, deductible vs. not) are always flagged for your accountant or IRS.gov, never answered.
- It reflects only what's in Gusto — income, expenses, or contractor payments made outside Gusto are outside its view and still need to be added by hand.
- Requires connecting your Gusto account; it only sees the data categories you grant access to.
