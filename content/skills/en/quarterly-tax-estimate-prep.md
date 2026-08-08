---
name: Quarterly Tax Estimate Prep
logo: /skills/quarterly-tax-estimate-prep.svg
category: finance
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "Get your numbers ready for the quarterly estimate — not a tax bill"
description: "Organizes your income and expenses into the inputs a quarterly estimated tax payment needs (net profit, prior-year safe-harbor figure, payment date), and shows a rough, clearly-labeled ballpark range — never a final number, never filed, never a substitute for a CPA or IRS Form 1040-ES."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You said "help me get ready for my quarterly taxes" or "what do I need before I calculate my estimated payment?"
- A quarterly deadline (mid-April, mid-June, mid-September, mid-January) is coming up and you want your income/expense numbers organized before you sit down with a calculator, your accountant, or Form 1040-ES.
- You want a **ballpark range** to sanity-check against what your CPA or software gives you — not a number you'll actually pay without checking.
- You want the deadline dates and what counts as "safe harbor" explained in plain language.

Do not use it to get a final payment amount to submit to the IRS, to decide your withholding, or to skip a CPA/tax software for the actual filing — it produces a rough range from the numbers you give it, and says so every time.

## What it does

- **Organizes the inputs**: year-to-date net profit (income minus business expenses), last year's total tax liability (for the safe-harbor comparison), and which quarter you're prepping for.
- **States the safe-harbor rule** in plain terms (paying roughly last year's liability, or this year's, whichever is lower, generally avoids a penalty) as a general rule to verify, not a personalized ruling.
- **Shows a labeled ballpark range**, computed only from the numbers supplied, with the self-employment tax rate and a rough income-tax range shown separately and the math shown step by step — so it's checkable, not a black box.
- **Flags every assumption**: if a number is missing (last year's liability, YTD expenses, filing status), it says exactly what's missing and gives the range **with** and **without** that assumption rather than picking one silently.
- **Always closes with the same caveat**: this is a planning estimate from the inputs given, not a filed number, not tax advice, and not a substitute for Form 1040-ES, tax software, or a CPA/EA — the real number depends on details (deductions, credits, other income) this skill was not given and should not guess.

It never states a number as final, never tells the user to skip consulting a professional, and never invents YTD income or expenses the user didn't provide.

**Deferring is not the whole answer.** When something's deductibility depends on
the specific situation — home office, a phone used for both, a trip that mixed
work and personal — say what to gather anyway: square footage and total home
cost, the split between business and personal use, dates and purpose of the
trip, receipts. Then hand the call to the professional. "Ask your accountant"
with nothing else leaves the person exactly where they started.

## How to use

1. Give your year-to-date net profit (or income and expenses separately) and, if you have it, last year's total tax liability.
2. Say which quarter you're prepping for.
3. Review the ballpark range and the assumptions it's built on — if something looks off, it's because an input was missing, not guessed.
4. Take the range to Form 1040-ES, your tax software, or your CPA/EA to get the actual payment amount — this skill's output is a planning aid, not the number you send in.

## Best for

Freelancers, solo founders, and small business owners who want to walk into estimated-tax season with organized numbers and a sanity-check range instead of starting cold. Not for anyone who wants a final payment figure without professional or software confirmation — the skill refuses to present its range as anything other than a rough, assumption-flagged estimate.
