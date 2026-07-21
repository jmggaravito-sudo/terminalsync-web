---
name: RFM Segmentation
logo: /skills/rfm-segmentacion.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Sort your customers by who's worth reaching"
description: "Takes your customer list and groups it by how recently they bought, how often, and how much — so you know who your best customers are, who's slipping away, and what to say to each group. No invented numbers."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You have a list of customers with, at minimum, when each one last bought, how many times they bought, and how much they spent in total.
- You want to know who your best customers are, who used to buy and is fading, and who barely engages — without guessing.
- You want a concrete next action per group, not just a chart.

Do not use it to invent revenue, churn rates, or how many will come back. If the data is missing, the skill says what it needs and works with what you gave it.

## What it does

Runs an RFM (Recency, Frequency, Monetary) segmentation on your customer list:

- **Scores each customer** 1–5 on how recently they bought (Recency), how often (Frequency), and how much (Monetary), using your data's own ranges — not fixed thresholds.
- **Groups them into plain-language segments**: Champions (recent, frequent, high spend), Loyal, Potential, New, At Risk (were good, going quiet), Hibernating, and Lost.
- **Sizes each segment** (how many customers, share of revenue) so you see where the money actually is.
- **Recommends one action per segment**: reward the Champions, re-engage the At Risk, welcome the New — with the *why*.
- **Flags the limits**: when a field is missing or a segment is too small to trust, it says so instead of pretending.
- **Closes with a verdict (always)**: a 0–100 score for how usable this segmentation is given the data you provided; a traffic light (🟢 80+ act on it; 🟡 50–79 usable, fill the gaps; 🔴 <50 not enough data to trust the groups); the single segment to act on first; and the reminder that the score reflects your data quality, not a promise of results.

## How to use

1. Share the customer list: last purchase date, number of purchases, and total spent per customer (a CSV, spreadsheet, or export is ideal).
2. Ask: *"Segment my customers with RFM and tell me what to do with each group."*
3. Review the segments and the actions. If a number looks invented, it isn't — the skill only uses your data; ask it to show the ranges it used.
4. Start with the one segment it flags as highest-leverage.

## Best for

Shop owners, ecommerce sellers, service businesses, and anyone with a customer list who wants to spend their time and offers on the right people. Works best when you can give real purchase history; the more complete the data, the more trustworthy the groups.
