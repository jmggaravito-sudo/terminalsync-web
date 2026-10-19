---
name: Tiendanube
logo: /plugins/tiendanube.svg
category: ecommerce
status: available
tagline: "Design the promo your margin survives, then the coupon goes live in your store."
description: "Bundles the Tiendanube connector (official Tiendanube/Nuvemshop MCP: your store's products, stock, orders, customers, coupons and promotions over OAuth) with Promos & Coupons (designs the discount — goal, margin, hard limits — and closes with a verdict on whether it's ready to launch), so the coupon the skill pressure-tests is the coupon that actually gets created in your store — after you approve it."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: tiendanube
skillSlugs: ["promos-cupones"]
---
## When to use

- Your store runs on Tiendanube and promos always come out the same way: you invent a discount number in your head, create the coupon in the admin panel, and hope the margin survives.
- You want the guardrails decided before the discount goes live — a floor ("never below cost"), a limit ("first purchase only"), a goal (clear stock, win back customers, first-time buyers) — instead of deciding them inside the coupon form.
- You also run no-code promotions (free shipping, automatic discounts) and want those set up with the same discipline.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Tiendanube (the connector)** is the official hosted Tiendanube/Nuvemshop MCP: with your own store login (no API key to paste), the agent reads your products, stock, orders and customers, and works with your coupons and promotions — `create_coupon` (percentage, fixed amount or free shipping, with a first-purchase restriction), `update_coupon`, `create_promotion` (automatic, no code) and more. Actions that change your store go through a confirmation step: the AI shows what it's about to do and waits for your approval.
- **Promos & Coupons (the skill)** designs the discount before it exists: the goal, the margin it has to survive, the hard limits, and who it's for — then closes with a 0–100 verdict on whether it's ready to launch. If the math doesn't work, it says so instead of dressing up a promo that loses money. Its last step — "set up the code in your store" — is exactly what the connector does.

**A real example:** *"Design a 15% coupon for customers who haven't bought in 60 days — never below cost, valid through Friday."* The skill checks it against your goal and your limits and hands you the finished design; you approve, and the coupon is created in your store through the connector — no detour through the admin panel.

## How to use

1. Install the Plugin and connect your Tiendanube store — no API key; you log in with your own account.
2. Give the skill the goal, your rough margin or cost, and the hard limits (e.g. "nothing below cost", "first purchase only"). It asks for what's missing instead of inventing it.
3. Read the verdict: 🟢 launch it, 🟡 close the guardrails or the margin first, 🔴 it probably loses money. One change at a time.
4. Approve, and the coupon or promotion gets created in your store through the connector — after the confirmation step, not before.

## Why the bundle works

The skill alone designs a promo you then have to key in by hand; the connector alone creates whatever coupon you ask for — including one that eats your margin. Together: the design is pressure-tested before it exists, and the thing you approved is the thing that goes live. No transcribing a discount from a chat into a form.

## Limits

- The skill's verdict scores the design, not the outcome — it is not a prediction of how much you'll sell.
- Your margin and cost numbers come from you. The connector can show what the store sells and who buys, but it doesn't audit your costs, and the skill never invents them.
- Creating a coupon or promotion requires your approval through the connector's confirmation step. Deleting a coupon or promotion is irreversible — the docs recommend deactivating instead (`valid=false` / `published=false`), which is what this pack does by default.
- This is a hosted server (`admin-mcp.tiendanube.com`), one connection per store: what the agent can see and do is bounded by your store user's permissions. Brazilian stores use the separate Nuvemshop endpoint, which this connector doesn't point to.
