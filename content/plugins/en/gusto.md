---
name: Gusto
logo: /plugins/gusto.svg
category: operations
status: available
tagline: "Your contractor list already lives in Gusto — get the 1099 sort without exporting it."
description: "Bundles the Gusto connector (official, read-only: your contractors and their payment history, over your own account login) with 1099/W-9 Organizer (sorts who you paid into who likely needs a 1099-NEC, who doesn't, whose W-9 is missing, and what's unresolved), so January doesn't start with a CSV export."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: gusto
skillSlugs: ["1099-w9-organizer"]
---
## When to use

- You pay contractors through Gusto, and the 1099 deadline is the kind of thing you'd rather handle in an afternoon than in a January scramble.
- You want to ask "who do I need to send a 1099 to?" and get an answer read from the same account you pay them from — not a spreadsheet you rebuilt by hand.
- You want a running read on whose W-9 still needs chasing while there's still time to chase it.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Gusto (the connector)** is Gusto's own official hosted server. You connect it with your Gusto account login — no API key to paste — and it reads your contractors, their payment history, your pay schedules and payrolls. It's read-only by design: it cannot run a payroll, move money, or change anyone's record.
- **1099/W-9 Organizer (the skill)** sorts that list of payees into who likely needs a 1099-NEC (per the current IRS threshold and the corporate exception), who likely doesn't (under the threshold, a corporation, or paid through a card/PayPal-type platform where the platform — not you — issues the 1099-K), whose W-9 is missing, and who's unresolved and needs a human — never inventing a total, an SSN/EIN, or a worker-classification decision.

**A real example:** it's December and you want to get ahead of January instead of scrambling. You ask *"look at who we paid as contractors this year and tell me who needs a 1099."* Gusto reads the contractor list and what each one was paid; 1099/W-9 Organizer sorts them into needs-a-1099 / doesn't / missing-W-9 / unresolved, and flags anyone whose entity type or total isn't clear enough to bucket. What used to be a payroll export plus an afternoon of IRS rules is one question.

## How to use

1. Connect Gusto with your own account login: a browser window opens, you sign in, and you choose which categories of data to share — grant Contractor Data and Payroll Data, and only what you want the agent to see.
2. Ask: *"who did we pay as contractors this year, and who needs a 1099?"*
3. Chase the missing W-9s first, and take anything flagged "unresolved" to your accountant before the January 31 deadline.

## Why the bundle works

Gusto alone can tell you what you paid each contractor — it doesn't apply IRS rules to the list, and its own server is read-only by design. 1099/W-9 Organizer alone needs you to re-type your payees into a chat window, one contractor at a time. Together, the connector supplies the names and totals already sitting in your payroll account, and the skill applies the IRS-stated rules to them. It's the same pairing the Google Sheets Plugin offers for a spreadsheet — but pointed at the account the payments actually came from.

## Limits

- Read-only end to end: it never files a 1099, never collects a W-9, never runs payroll, and never edits a contractor's record. Filing still happens in Gusto, your tax software, or with your accountant.
- Only as good as what Gusto exposes: where entity type, W-9 status, or the total paid isn't available, the payee lands in "unresolved" — never a guess.
- Never invents an SSN/EIN and never decides whether someone should be a W-2 employee instead — borderline classification gets flagged for a CPA/EA, not resolved here.
- The January 31 deadline it states is the general 1099-NEC rule to verify for the current tax year, not a personalized due date.
