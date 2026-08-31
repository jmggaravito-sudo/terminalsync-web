---
name: Ecommerce Email & SMS Retention Kit
logo: /logos/ts-kit.svg
category: marketing
status: available
tagline: "Turn what's actually selling into an email or SMS campaign, and check whether it worked — without exporting a spreadsheet first."
description: "A coherent marketing bundle for an ecommerce merchant who sells on Square and runs (or wants to run) email/SMS campaigns in Klaviyo: ground the promo in real sales and catalog data, draft the copy, send the campaign, and check its real performance."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: square
    reason: "Supplies the real sales and catalog data — best sellers, low stock, recent orders and customers — so a promo campaign is grounded in what's actually happening in the store instead of a guess."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the promo goal and Square's sales/catalog data into structured subject line, body copy, and a call to action, ready to drop into a Klaviyo campaign instead of a blank compose window."
  - kind: connector
    slug: klaviyo
    reason: "Turns the drafted copy into an actual email or SMS campaign against the merchant's real lists and segments, and reports opens, clicks, and conversions so the merchant knows whether it worked."
---
## Who it is for

An ecommerce merchant or small marketing team who sells through Square and runs (or wants to run) email/SMS campaigns in Klaviyo, and wants each campaign grounded in real sales and catalog data instead of a guess about what to promote.

Use it when the recurring job is "what should we promote, and did the campaign actually work?" for a store whose sales live in Square and whose campaigns go out through Klaviyo.

## What it helps you do

This kit covers the promo-to-performance loop of owned-channel ecommerce marketing:

- Check **what's actually selling, what's low on stock, and who the recent customers are**, straight from Square.
- Turn that real data plus a promo goal into **structured campaign copy** (subject line, body, call to action) with Doc Co-authoring.
- Turn the copy into an actual **email or SMS campaign** in Klaviyo, against real lists and segments.
- Check **how the campaign performed** — opens, clicks, conversions — in Klaviyo, so the next campaign isn't a guess either.

The expected outcome is a promo campaign that is grounded in real inventory/sales data, drafted without starting from a blank compose window, sent through the merchant's own Klaviyo account, and checked against real performance numbers — instead of three disconnected tools and a hunch about what to send.

## What's included

### Connectors

- **Square** — reads sales, orders, catalog, inventory, and customers from the real store, so "what's selling" or "what's low on stock" has a real answer to build a promo around.
- **Klaviyo** — turns drafted copy into a real email or SMS campaign against the merchant's own lists and segments, and reports campaign and flow performance (opens, clicks, conversions) afterward.

### Skills

- **Doc Co-authoring** — turns the promo goal and the Square data behind it into structured campaign copy — subject line, body, and call to action — instead of a blank compose window in Klaviyo.

### CLI

No CLI tool is included. The target user is a merchant or marketer, and the workflow — check sales, draft copy, send campaign, check performance — does not require terminal execution.

## How to use it

1. Install the kit, connect Square with an access token, and connect Klaviyo with its own account login (OAuth, no API key to paste).
2. Ask *"what's selling well this week, and what's low on stock?"* to check Square before deciding what to promote.
3. Give Doc Co-authoring the promo goal (clear excess inventory, launch a new line, a seasonal offer) and the Square data, and ask for a structured subject line, body copy, and call to action.
4. Ask Klaviyo to create an email or SMS campaign with that copy against the right list or segment, and review it before sending — Klaviyo can send real campaigns.
5. A few days later, ask *"how did that campaign perform?"* to get opens, clicks, and conversions from Klaviyo, and feed that into the next promo.

## Why these pieces belong together

The kit is coherent because it follows one loop from real data to a checked result, not a pile of unrelated marketing tools:

- Square supplies **the real signal** of what's happening in the store — sales, stock, customers.
- Doc Co-authoring turns that signal plus a goal into **copy a customer can actually read**.
- Klaviyo turns the copy into **a real campaign** and reports **whether it worked**.

Installed separately, the merchant checks a Square dashboard, exports numbers to figure out what to promote, drafts copy from a blank page, and checks campaign performance in a different tab days later with no link back to what triggered the promo. Installed together, the kit gives one path: **check what's selling → draft the campaign around it → send it → check whether it worked**.

It overlaps with the Ecommerce Storefront Kit on Square, but the purpose is different: that kit is staff-facing catalog and inventory operations; this kit is customer-facing promotional campaigns. For paid social or search ads instead of owned email/SMS, use the Marketing Campaign & SEO Kit or the Social Ad Creative Studio Kit — this kit does not touch paid channels.

## Limits

- It does not run paid social or search ads, manage ad budgets, or produce ad creative — for that, use the Marketing Campaign & SEO Kit or the Social Ad Creative Studio Kit.
- It does not manage day-to-day storefront operations, staff announcements, or product description copy for the catalog itself — for that, use the Ecommerce Storefront Kit.
- Klaviyo campaigns and SMS sends are real once you confirm them; review before sending, and SMS carries its own opt-in/compliance requirements that this kit does not manage for you.
- Klaviyo's full feature set is restricted by Klaviyo to Owner, Admin, or Manager account roles, per Klaviyo's own docs.
- Square and Klaviyo each need their own account/connection, and the kit only sees what those accounts allow.
- It does not guarantee open rates, click rates, or revenue from a campaign — those depend on the offer, list quality, and timing, not just the copy.
