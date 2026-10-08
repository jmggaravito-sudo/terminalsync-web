---
name: Airtable
logo: /plugins/airtable.svg
category: marketing
status: available
tagline: "Your customer list, segmented by who's worth reaching — no CSV export."
description: "Bundles the Airtable connector (reads the customer base you already keep — clients, orders, purchase history) with RFM Segmentation (scores every customer on recency, frequency, and spend, groups them into Champions / Loyal / At Risk, and names one action per group), so 'who are my best customers' is answered from your live base instead of an exported spreadsheet."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: airtable
skillSlugs: ["rfm-segmentacion"]
---
## When to use

- Your customer or order data lives in an Airtable base (a Clients CRM, an Orders tracker) and you keep exporting it to a spreadsheet to figure out who your best customers are.
- You want to know who your champions are, who used to buy and is fading, and who barely engages — from the data you already have, not a gut feeling.
- You want one concrete action per group (reward the Champions, re-engage the At Risk), not just a chart.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Airtable (the connector)** reads the bases you grant it — it can list and search records, so the agent pulls your customers with their last purchase date, purchase count, and total spend straight from the base.
- **RFM Segmentation (the skill)** scores each customer 1–5 on Recency, Frequency, and Monetary value using your own data's ranges — not fixed thresholds — groups them into plain-language segments (Champions, Loyal, Potential, New, At Risk, Hibernating, Lost), sizes each one by customers and revenue share, and recommends one action per segment.

**A real example:** you keep a "Clients" table with every purchase. You ask *"segment my customers with RFM and tell me what to do with each group."* The agent reads the records from your Airtable base — no export, no pasting — and the skill returns the segments with how many customers and how much revenue each holds, plus the single segment to act on first.

## How to use

1. Install the Plugin and connect Airtable — a Personal Access Token with read access to the base that holds your customers; you pick exactly which bases it can see.
2. Check that your base has what RFM needs: last purchase date, purchase count, and total spend per customer.
3. Ask: *"Read my customers from Airtable and segment them with RFM."*
4. Review the segments and the one action per group; start with the segment the skill flags as highest-leverage.

## Why the bundle works

The RFM skill alone needs a customer list with purchase history — data you'd otherwise export, clean, and paste by hand. The connector alone reads your base but doesn't know what to do with three columns of dates and amounts. Together: the base you already keep becomes the input, and "who's worth your next offer" gets answered in place — no spreadsheet in between.

## Limits

- It can only segment what's in the base you connect — customers who bought through channels you don't log in Airtable are invisible to it.
- The segmentation needs real purchase fields: if last purchase date, purchase count, or spend is missing, the skill says what's missing instead of inventing numbers.
- It never promises a result — the 0–100 score it closes with reflects your data quality, not a forecast of who will buy again.
- Reading is enough for this job: the connector can also write records if you grant write scopes, but this Plugin doesn't need them.
