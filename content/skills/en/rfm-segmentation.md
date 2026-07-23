---
name: RFM Segmentation
logo: /skills/rfm-segmentation.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Sort customers by Recency, Frequency and Money"
description: "Turns a customer/order export or a connected store into RFM segments (champions, loyal, at-risk, hibernating, new) with a clear action per group, and states what it could and could not see before recommending spend."
license: "proprietary"
marketplaceSource: "terminalsync"
catalogReady: false
compatibleWith: ["claude", "codex"]
---
## When to use

- You have customers and orders — in Shopify, Square, HubSpot, a Google Sheet, or a CSV export — and you want to know **who to treat differently** instead of blasting everyone the same.
- You're about to spend on a campaign and want to point it at the customers most likely to respond.
- You keep hearing "focus on your best customers" but have no concrete list of who they are.
- You want the reusable segmentation an automated win-back or promo run can act on — this skill is the capability the agent uses; it does not send anything on its own.

If you can't connect a store, the skill works from a pasted or exported order table (customer id, order date, order total). If you only have totals with no dates, it will say RFM can't be computed and offer a simpler split.

## What it does

Builds an RFM segmentation from your order history:

- **Data note**: how many customers and orders it saw, the date range, and anything missing (no dates, no per-customer id, refunds not excluded) that weakens the result.
- **The three scores**: Recency (how long since last order), Frequency (how many orders), Monetary (total spent) — each scored 1–5 with the thresholds it used, so you can see why a customer landed where they did.
- **Named segments with a plan**: champions (reward + ask for referrals/reviews), loyal (upsell), potential loyalists (nudge to a second/third order), new (onboard), at-risk (win-back before they're gone), hibernating (last-chance offer), lost (don't overspend). Each with the count and share of revenue.
- **Where the money is**: which segments hold the revenue, so you spend on the few that matter.
- **The verdict (always close with this)**: a **0–100 score** for how actionable this segmentation is given the data quality; a traffic light with a threshold (🟢 80+ clean data, act on it; 🟡 50–79 usable, but close the data gap noted; 🔴 <50 not enough history or missing dates/ids — fix the export first); **the single highest-impact next move** (usually one segment to act on this week); and the reminder that the score reflects the data it could see, not a guarantee of response.

It only sees the rows you give it. It will not invent revenue, guess missing dates, or promise a segment will convert.

## How to use

1. Connect Shopify/Square/HubSpot, or paste/export an order table with at least: customer id or email, order date, order total.
2. Tell it the business context: *"Segment my last 12 months of orders; I sell repeat consumables"* vs. *"one-time high-ticket."*
3. Ask for the segments ranked by revenue, with the action per segment and the counts.
4. Pick one segment and ask it to draft the next step (a win-back message, a VIP perk) — or hand the segment to the matching skill/loop.
5. Re-run monthly; RFM is a moving picture, not a one-time label.

## Best for

Store owners, marketers, and customer-retention leads who want to stop treating every customer the same and don't have a data analyst. Best when you have at least a few months of dated orders with a per-customer identifier; weaker for brand-new stores, one-purchase businesses, or exports without dates.
