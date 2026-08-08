---
name: 1099/W-9 Organizer
logo: /skills/1099-w9-organizer.svg
category: finance
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Know who needs a 1099 before the deadline finds you"
description: "Reads your list of contractors/vendors paid this year and tells you who likely needs a 1099-NEC, whose W-9 is missing, and what's still unknown — using IRS-stated thresholds and rules, never guessing a dollar figure or SSN/EIN you didn't provide."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You said "who do I need to send a 1099 to?", "did I collect W-9s from everyone I paid?", or "am I about to miss the 1099 deadline?"
- You have a list of people/businesses you paid this year (contractors, freelancers, vendors) and want it sorted into "needs a 1099," "doesn't," and "not enough info to tell."
- You're not sure whether someone you paid counts as a contractor (needs a 1099) or should have been an employee (doesn't) — you want the distinction flagged, not decided for you.
- You want a tracker for W-9 collection status so you're not scrambling in January.

Do not use it to fill in a W-9/1099 with invented data (SSN, EIN, address) or to make the final worker-classification call — it flags ambiguous cases for a CPA/EA, it doesn't resolve them.

## What it does

Takes your list of payees (name, what they were paid, total paid, and W-9-on-file status if known) and returns:

- **Likely needs a 1099-NEC**: non-employee, paid $600 or more in the year, business structure isn't a C-corp/S-corp (per the current IRS threshold and corporate exception it's given) — cited as the current rule, with a note to confirm on IRS.gov since thresholds can change.
- **Likely doesn't need one**: paid under the threshold, or flagged as a corporation, or paid via a third-party network (credit card/PayPal/Stripe) where the platform — not you — issues the 1099-K.
- **Missing W-9**: anyone in the "likely needs a 1099" group with no W-9 on file, so you can chase it before the January deadline instead of after.
- **Unresolved / needs a human**: anyone where entity type, total paid, or worker-vs-employee status wasn't given, or looks borderline (e.g., someone paid regularly enough to look like an employee) — never silently defaulted into a bucket.
- **Deadline reminder**: states the general 1099-NEC filing deadline (January 31) as a fact to verify for the current tax year, not a personalized due date.

It never invents a payee's SSN/EIN, never fills in a W-9 on someone's behalf, and never rules on whether a worker should legally be a W-2 employee instead of a 1099 contractor — that determination has real legal consequences and gets flagged for a CPA/employment attorney, not decided here.

## How to use

1. List who you paid this year: name/business, total paid, entity type if known (individual, LLC, corporation), and whether you already have a signed W-9.
2. Get the three-way sort: needs a 1099, doesn't, and unresolved.
3. Chase the missing W-9s first — you can't file an accurate 1099 without one.
4. Take anything in "unresolved," especially worker-classification flags, to your accountant before the deadline, not after.

## Best for

Small business owners and solo founders who pay contractors or freelancers and don't have a bookkeeper tracking 1099 obligations for them. Not a substitute for a CPA/EA when a payee's status is genuinely ambiguous — the skill's job is to narrow the pile to the few cases that actually need a professional, not to make the final legal call.
