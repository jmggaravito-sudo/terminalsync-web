---
name: LTV Cohorts
logo: /skills/ltv-cohortes.svg
category: crm
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "See what a customer is really worth over time"
description: "Groups your customers by the month they first bought and tracks how much each group keeps spending and how many stay — so you see whether newer customers are worth more or less than older ones. Uses only your data, flags every assumption."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You want to know what a customer is worth over time, not just at first purchase — and whether that's getting better or worse.
- You can share orders with a customer id, order date, and amount (a transactions export is perfect).
- You want to see retention and cumulative value by cohort, and understand what it means for how much you can spend to get a customer.

Do not use it to invent lifetime value, retention curves, or future revenue. If the history is too short to project, the skill says so and sticks to what actually happened.

## What it does

Runs a cohort analysis of customer value:

- **Builds cohorts** by first-purchase month (or another period you choose) from your transactions.
- **Tracks retention**: what share of each cohort is still buying 1, 3, 6, 12 months in.
- **Tracks cumulative value**: how much an average customer from each cohort has spent by each month — the real LTV curve, built from your data.
- **Compares cohorts**: are newer customers spending more or less, staying longer or shorter, than older ones — and calls out the trend.
- **Explains what it means**: a rough sense of how much you can afford to spend to acquire a customer, with the caveat that it depends on margin and payback period.
- **Flags the limits**: short history, thin cohorts, or missing months — it labels projections as assumptions, never as facts.
- **Closes with a verdict (always)**: a 0–100 score for how trustworthy this analysis is given your data depth; a traffic light (🟢 80+ decision-ready; 🟡 50–79 directional, get more history; 🔴 <50 too little data to trust the curves); the single insight that matters most; and a note that the score reflects your data, not a guarantee of future value.

## How to use

1. Share your transactions: customer id, order date, and amount per order.
2. Ask: *"Do an LTV cohort analysis by first-purchase month and tell me if my newer customers are worth more."*
3. Review the cohorts and the trend; ask it to show its inputs if a number surprises you.
4. Use the payback view to sanity-check what you spend on acquisition — with your own margin.

## Best for

Ecommerce, subscriptions, and repeat-purchase businesses that want to understand real customer value and how much they can spend to grow. Works best with at least several months of transaction history.
