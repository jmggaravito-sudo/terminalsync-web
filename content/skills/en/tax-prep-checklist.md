---
name: Tax Prep Checklist
logo: /skills/tax-prep-checklist.svg
category: finance
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Know exactly what you need before tax season hits"
description: "Builds a personalized document and data checklist for filing a small business's taxes, based on entity type, state, employees/contractors, and what changed this year — without ever estimating what you owe or telling you how to file."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You said "what do I need to file my business taxes this year?" or "am I missing anything before I go to my accountant?"
- Tax season is approaching and you want a personalized list instead of a generic "here's what you need" article.
- Your situation changed this year — new entity type, first employee, first contractor, new state, a vehicle or home office added — and you're not sure what that adds to the pile.
- You want the checklist organized by where each document *comes from* (bank, payroll provider, payment processor, prior accountant) so gathering it is a to-do list, not a maze.

Do not use it to calculate what you owe, to decide how to file, or to interpret tax law for your specific situation — it does not do that. It is a document/data organizer, not a preparer or an advisor.

## What it does

Asks a short intake, then returns a checklist grouped by category:

- **Intake questions** (only what's needed): entity type (sole prop, LLC, S-corp, partnership, other/not sure), state(s) you operate in, whether you have employees, whether you paid contractors, whether anything changed since last year (new entity, new state, vehicle, home office, equipment purchases, a loan, an investor).
- **Income documents**: bank/merchant statements, 1099s you should expect to *receive*, invoices, platform payout reports (Stripe, Shopify, PayPal) — named by source, not assumed to exist.
- **Expense documents**: bank/card statements, mileage log, home-office measurements, receipts for large purchases, payroll reports if you have employees.
- **Prior-year references**: last year's return, depreciation schedules, carryforward losses — flagged as "ask your accountant for this if you switched preparers."
- **Entity-specific items**: only the ones that apply to the entity type given (e.g., K-1s for partnerships/S-corps, payroll tax filings if there are employees) — it does not list items for entity types the user doesn't have.
- **Open flags**: anything the intake couldn't resolve (e.g., "not sure if you're a sole prop or single-member LLC") is listed as a question for the accountant, not guessed.

It never tells the user what they owe, which forms to file, or how to classify a borderline item (worker vs. contractor, deductible vs. not) — those are flagged as **"ask your accountant/CPA or check IRS.gov"**, not answered.

## How to use

1. Answer the intake questions (entity type, state, employees/contractors, what changed this year). If you don't know an answer, say so — the skill will flag it instead of assuming.
2. Get the categorized checklist. Check off what you already have.
3. Use the "ask your accountant" flags as your actual agenda for the handoff call — they're the parts that need a professional, not a search engine.
4. Re-run it if your situation changes mid-year (e.g., you hire your first employee) to see what's newly added.

## Best for

Solo founders, freelancers, and small business owners without an in-house finance team who want to walk into tax season (or their accountant's office) with the right pile of documents instead of a guess. Not for anyone who needs an actual tax calculation, a filing decision, or advice on a specific tax position — that always goes to a licensed CPA/EA or a search of IRS.gov, and the skill says so every time it's asked to cross that line.
