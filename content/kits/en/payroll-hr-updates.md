---
name: Payroll & HR Updates Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Check who's on payroll and what it'll cost before the run, then tell the team what they need to know — without digging through Gusto tabs or writing every reminder from scratch."
description: "A coherent operations bundle for a small-business owner or office manager who runs payroll through Gusto: read the roster, pay schedule, and time sheets before each run, turn the numbers into a short cost summary, and draft the team-facing announcement or reminder that goes with it."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: gusto
    reason: "Reads the actual payroll data straight from Gusto — who's on the roster, the next pay period and pay schedule, contractor payments, and time sheets — so 'what's this payroll going to look like' has a real answer instead of a login-and-click session."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the roster, pay-period, and time-sheet numbers from Gusto into a short, structured payroll cost summary the owner can read or forward to a partner or accountant, instead of a wall of exported rows."
  - kind: skill
    slug: internal-comms
    reason: "Drafts the team-facing message that goes with the payroll cycle — a pay-date reminder, a time-sheet deadline, a new-hire welcome, a benefits-enrollment note — with the HR-sensitive-topic handling a payroll-adjacent message needs."
---
## Who it is for

The owner of a small business, or the office manager who runs payroll for one, who pays their team through Gusto and needs two things every cycle: a quick read on who's getting paid and what it costs, and a clear message to send the team about it.

Use it when the recurring job is "check payroll, then tell people what they need to know" — not running payroll itself, and not full HR case management.

## What it helps you do

This kit covers the check-then-communicate loop around a payroll cycle:

- See **who's on the roster, the next pay date, and what a contractor was paid** by reading Gusto directly.
- Check **time sheets and hours logged** before a pay run closes, so nothing looks off at the last minute.
- Turn that into a short, written **payroll cost summary** with Doc Co-authoring — for the owner's own records or to forward to a partner or accountant.
- Draft the **team-facing message** with Internal Comms — a pay-date reminder, a time-sheet deadline, a new-hire welcome, or a benefits-enrollment note — handled with the care an HR-adjacent message needs.

The expected outcome is that the owner walks into each payroll cycle with a clear read on the numbers and a message ready to send the team, instead of logging into Gusto, squinting at tabs, and writing the reminder from memory.

## What's included

### Connectors

- **Gusto** — reads company roster, employee and contractor records, pay schedule and pay periods, contractor payments, and time sheets straight from the account. It is **read-only by design**: it can answer "who's on payroll" or "what's the next pay date," it cannot run a payroll, move money, or change an employee's record.

### Skills

- **Doc Co-authoring** — structures the roster, pay-period, and time-sheet numbers pulled from Gusto into a clean, short payroll cost summary instead of a raw export.
- **Internal Comms** — drafts the team-facing announcement or reminder for the payroll cycle, with explicit handling for the HR-sensitive topics (benefits, pay dates, new hires) a payroll-adjacent message often touches.

## How to use it

1. Install the kit and connect Gusto — a browser window opens for you to sign in and choose which data categories to share (Company, Employee, Contractor, Payroll, Time Tracking).
2. Ask *"who's on payroll right now, and what's our next pay date?"* or *"what did we pay our contractors last month?"* to get the real numbers.
3. Before a pay run closes, ask *"are there any time sheets that look incomplete or missing hours this period?"*
4. Ask Doc Co-authoring to *"write this up as a short payroll cost summary for this pay period"* using the numbers above.
5. Ask Internal Comms to *"draft a reminder to the team that time sheets are due Friday"* or *"draft a welcome note for our new hire starting Monday"*.

## Why these pieces belong together

The kit is coherent because it follows one loop: **read the payroll data → summarize the cost → tell the team.**

- Gusto is **the source of truth for payroll and roster data** — nothing here is guessed or remembered from last cycle.
- Doc Co-authoring turns that data into **the summary a non-payroll-specialist can actually read**, on the owner's own side of the loop.
- Internal Comms turns the same cycle into **the message the team receives**, with the sensitive-topic handling that pay dates, benefits, and new hires require — it is the same skill used elsewhere in this catalog for team-facing announcements, applied here to the payroll cadence specifically.

Installed separately, the owner still logs into Gusto, reads the tabs by hand, and writes every team reminder from a blank page each cycle. Installed together, it is one path: **check the roster and numbers → write the summary → send the team update.**

It is distinct from the existing finance kits in this catalog: the Small Business Finance Kit and the Bookkeeping & Tax Handoff Kit both read Xero's books — invoices, receivables, P&L — for accounting and accountant handoff. This kit reads Gusto's payroll and roster data for a completely different job: checking a payroll cycle and communicating it to the team. It also differs from the Team Operations Kit, which uses ClickUp and Slack for task-board status updates, not payroll.

## Limits

- Gusto's connector is **read-only** — it cannot run a payroll, edit an employee or contractor record, change compensation or benefits, or modify company settings. Running payroll itself still happens inside Gusto.
- It does not calculate or file payroll taxes, generate tax forms, or give tax advice — it reads whatever Gusto's account already shows for payroll tax information; the accountant or Gusto itself handles filing.
- It does not manage full HR case work — onboarding paperwork, benefits enrollment processing, performance reviews, or terminations. Internal Comms can help draft a message about one of these but does not replace HR, legal, or compliance review for sensitive matters.
- Gusto needs its own OAuth connection and lets you choose which data categories (Company, Employee, Contractor, Payroll, Time Tracking) to share; the kit only sees what you grant.
- It does not send anything on its own — it drafts the summary and the message; the owner reviews and sends them.
