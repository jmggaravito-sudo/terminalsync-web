---
name: LTV & Cohorts
logo: /skills/ltv-cohorts.svg
category: finance
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "See lifetime value by cohort and what it's worth to acquire a customer"
description: "Groups customers by when they first bought, tracks how much each cohort spends over time, estimates lifetime value, and shows what you can afford to pay to acquire a customer — with the assumptions stated plainly."
license: "proprietary"
marketplaceSource: "terminalsync"
catalogReady: false
compatibleWith: ["claude", "codex"]
---
## When to use

- You know your monthly revenue but not what a customer is actually worth over time, so you're guessing at how much you can spend to get one.
- You want to see whether newer customers are better or worse than older ones (is retention improving or quietly slipping?).
- You're deciding on ad spend, a discount, or a subscription price and need a defensible number, not a gut feel.
- You want the reusable analysis a finance or growth loop can call — it computes and explains; the spending decision stays yours.

Works from a connected store (Shopify, Square) or a pasted order export with customer id, order date, and order total. If orders aren't tied to a customer id, it will say cohorts can't be built and ask for identified orders.

## What it does

- **Builds cohorts**: groups customers by first-purchase month and tracks each group's spend in the months after — so you can see retention and repeat behavior, not just a single average.
- **Estimates LTV honestly**: reports realized value to date per cohort, and only projects forward with the method and assumptions shown (retention curve, average order value, margin if you provide it) — clearly labeled as an estimate, with a conservative and an optimistic figure rather than one false-precision number.
- **Turns LTV into a spending ceiling**: shows a rough max you can pay to acquire a customer (CAC ceiling) given the LTV estimate and a payback window you choose — the number most owners actually need.
- **Flags the trend**: whether recent cohorts are retaining better or worse than older ones, which matters more than the headline average.
- **The verdict (always close with this)**: a **0–100 score** for how trustworthy this LTV read is (history length, cohort sizes, whether margin was provided); a traffic light with a threshold (🟢 80+ enough history to plan spend; 🟡 50–79 directional, treat the CAC ceiling as a cap not a target; 🔴 <50 too little history or missing margin — measure more before betting budget); **the single most useful number to act on** (usually the conservative CAC ceiling); and the reminder that projections are estimates from past behavior, not guaranteed future value.

It won't present a projection as a fact, won't hide small-sample noise, and will separate money already earned from money it's forecasting.

## How to use

1. Connect your store or paste an order export with customer id, order date, and total (add margin % for profit-based LTV).
2. Say what you're deciding: *"How much can I spend to acquire a customer and break even in 3 months?"*
3. Ask for cohorts by first-purchase month, realized LTV per cohort, and the projected range with assumptions.
4. Use the conservative CAC ceiling as your spending cap, not the optimistic one.
5. Re-run as cohorts mature; early cohorts are the least reliable and firm up over time.

## Best for

Owners and operators deciding acquisition spend, pricing, or retention investment who need a defensible LTV without a finance analyst. Best with a year or more of identified orders; weaker for young businesses, tiny cohorts, or exports without a customer identifier.
