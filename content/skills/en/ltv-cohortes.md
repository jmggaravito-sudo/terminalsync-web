---
name: LTV Cohorts
logo: /skills/ltv-cohortes.svg
category: marketing
vendors: ["claude", "codex", "gemini"]
author: "TerminalSync"
status: available
tagline: "See what a customer is really worth over time"
description: "Groups your customers by the month they first bought and tracks how much each group keeps spending and how many stay — so you see whether newer customers are worth more or less than older ones. Uses only your data, flags every assumption."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## When to use

- You want to know what a customer is worth over time, not just at first purchase — and whether that's getting better or worse.
- You can share orders with a customer id, order date, and amount (a transactions export is perfect).
- You want to see retention and cumulative value by cohort, and understand what it means for how much you can spend to get a customer.

Do not use it to invent lifetime value, retention curves, or future revenue. If the history is too short to project, the skill says so and sticks to what actually happened.

**If you hand over the rows, it does the analysis. If you only describe them, it does not invent them.**

That distinction is the whole rule, and it cuts both ways:

- **Rows in hand** (a pasted export, a file, even twenty lines) → it builds the cohorts and reports what those rows say. Refusing here would be its own kind of failure: a refusal invented to look careful.
- **Only a description** ("I have 18,000 orders since 2024") → it will not produce retention rates, cumulative values or a score. A fabricated curve is worse than no curve, because it looks like a finding.

When the rows are missing it still does everything that does not need them: it asks for the export, and says upfront what your history can and cannot support — that four months is too short for a reliable curve, that months with a handful of customers need grouping, what the analysis will look like once the data arrives. Refusing to invent is not the same as refusing to help.

## What it does

Runs a cohort analysis of customer value:

- **Builds cohorts** by first-purchase month (or another period you choose) from your transactions.
- **Tracks retention**: what share of each cohort is still buying 1, 3, 6, 12 months in.
- **Tracks cumulative value**: how much an average customer from each cohort has spent by each month — the real LTV curve, built from your data.
- **Compares cohorts**: are newer customers spending more or less, staying longer or shorter, than older ones — and calls out the trend.
- **Explains what it means**: a rough sense of how much you can afford to spend to acquire a customer, with the caveat that it depends on margin and payback period.
- **Flags the limits**: short history, thin cohorts, or missing months — it labels projections as assumptions, never as facts.
- **Groups thin cohorts instead of reporting noise**: when a month has only a handful of new customers, it says so and aggregates (by quarter, usually) rather than presenting a jumpy line as a trend.
- **Closes with a verdict — when it actually ran the numbers**: a 0–100 score for how trustworthy the analysis is given your data depth; a traffic light (🟢 80+ decision-ready; 🟡 50–79 directional, get more history; 🔴 <50 too little data to trust the curves); the single insight that matters most; and a note that the score reflects your data, not a guarantee of future value. If it never received the data, there is no verdict to give — it says what it needs instead. A score over numbers it made up would be the most misleading output of all.

## How to use

1. Share your transactions: customer id, order date, and amount per order.
2. Ask: *"Do an LTV cohort analysis by first-purchase month and tell me if my newer customers are worth more."*
3. Review the cohorts and the trend; ask it to show its inputs if a number surprises you.
4. Use the payback view to sanity-check what you spend on acquisition — with your own margin.

## Best for

Ecommerce, subscriptions, and repeat-purchase businesses that want to understand real customer value and how much they can spend to grow. Works best with at least several months of transaction history.
