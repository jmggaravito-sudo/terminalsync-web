---
name: Gusto
logo: /connectors/gusto.svg
category: operations
status: available
tagline: "Your contractor payments, read straight from Gusto — sorted into who needs a 1099."
description: "Bundles the Gusto connector (reads your contractor list and payment history straight from your payroll account, read-only) with 1099/W-9 Organizer (sorts payees into needs-a-1099, doesn't, and missing-W-9 per IRS-stated rules), so the numbers behind the sort come from your actual payroll platform instead of a hand-typed list."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["1099-w9-organizer"]
---
## When to use

- You pay contractors through Gusto and want to know who needs a 1099-NEC without pulling a report and re-typing it into a spreadsheet.
- You want to catch missing W-9s before the January deadline, using the payment totals Gusto already has on file.
- You want the read that's honest about what it can and can't tell you — this doesn't file anything or calculate what you owe.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Gusto (the connector)** reads your contractor roster and payment history — `list_company_contractors` and `list_company_contractor_payments` — directly from your payroll account, read-only.
- **1099/W-9 Organizer (the skill)** takes that payee list and total-paid figures and sorts them into likely-needs-a-1099-NEC, likely-doesn't, missing-W-9, and unresolved — per the current IRS threshold and corporate exception, never guessing a figure it wasn't given.

**A real example:** you say *"who do I need to send a 1099 to this year?"* Gusto pulls your contractor list and what each one was paid through the platform. 1099/W-9 Organizer sorts that list: who crossed the $600 threshold, who's a corporation and likely exempt, and who's missing a W-9 on file — so you chase the paperwork gap while there's still time before the deadline.

## How to use

1. Install the Plugin and connect Gusto — sign in with your Gusto account and grant Contractor Data and Payroll Data access (no API key to paste).
2. Ask: *"Pull my contractor payments this year and tell me who needs a 1099."*
3. Review the three-way sort and chase any flagged missing W-9s first.
4. Take anything marked "unresolved" — like a borderline worker-classification case — to your accountant before the deadline.

## Why the bundle works

1099/W-9 Organizer alone is only as good as the payee list you hand it — if you mistype a total or forget someone, the sort is wrong. Gusto alone can show you contractor payments, but it doesn't know the $600 threshold, the corporate exception, or which of your payees still needs a W-9. Together: Gusto supplies the real payment numbers, and the skill applies the IRS-stated rules to them — so the sort is built on your actual payroll data, not a hand-copied guess.

## Limits

- Gusto is **read-only** — it can't file a 1099, run payroll, or edit a contractor's record; that still happens inside Gusto or your filing software.
- 1099/W-9 Organizer never invents a payee's SSN/EIN and never makes the final worker-classification call — ambiguous cases are flagged for your CPA/EA, not decided here.
- It only sees contractors and payments in the categories you granted Gusto access to (Contractor Data, Payroll Data).
- Gusto's contractor payment tools don't track whether a signed W-9 is on file — that status still comes from what you tell the skill.
