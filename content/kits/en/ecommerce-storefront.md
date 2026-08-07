---
name: Ecommerce Storefront Kit
logo: /logos/ts-kit.svg
category: ecommerce
status: available
tagline: "Check sales and stock, draft the copy for a new product line, and tell the team what changed — the day-to-day of running a Square storefront."
description: "A coherent bundle for a merchant or small retail team running their store on Square: read sales, inventory, and orders in plain language, co-author the description copy for a new product line, and tell store staff what's new before it hits the shelf or the site."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: square
    reason: "Reads and updates the actual storefront: catalog, orders, inventory, customers, and payments, so questions about sales or stock have a real answer and new items can be added without opening the dashboard."
  - kind: skill
    slug: doc-coauthoring
    reason: "Co-writes the structured description copy for a new product line or catalog update from the item details, instead of one-off, inconsistent blurbs."
  - kind: skill
    slug: internal-comms
    reason: "Turns a new product line, price change, or promo policy into a clear message for store staff, so the team knows what's changing before a customer asks."
---
## Who it is for

A merchant or small retail team running their store on Square — in person, online, or both — who needs to check sales and stock without opening a dashboard, write the description copy for new items, and make sure staff know about changes before customers do.

Use it when the recurring job is "what did we sell, what's low on stock, and does the team know what's new?" for a business whose catalog, orders, and payments live in Square.

## What it helps you do

This kit covers the day-to-day of running a Square storefront:

- Check **sales and orders**: what sold today, what's unfulfilled, what a specific customer bought.
- Check and update the **catalog and inventory**: add a new item, see what's low on stock.
- Co-author the **description copy** for a new product line or catalog update with Doc Co-authoring, from real item details instead of a blank page.
- Draft the **staff-facing announcement** for a new line, a price change, or a promo policy with Internal Comms, so the team hears it before a customer does.

The expected outcome is a merchant who can ask plain-language questions about their store, ship a new product line with real copy, and keep staff aligned — without three separate tools that don't talk to each other.

## What's included

### Connectors

- **Square** — reads and updates the catalog, orders, inventory, customers, and payments of the actual store; by default it runs in sandbox mode until you're ready to point it at your real account.

### Skills

- **Doc Co-authoring** — turns item details for a new product line or catalog update into structured, consistent description copy, iterating section by section instead of one inconsistent blurb per item.
- **Internal Comms** — turns a catalog change (new line, price change, promo or return policy update) into a clear message for store staff, so front-line and online teams stay aligned on what changed.

## How to use it

1. Install the kit and connect Square with an access token (starts in sandbox mode; switch to production when ready).
2. Ask *"what did we sell today, and what's still unfulfilled?"* or *"what's low on stock?"* to check the store.
3. When adding a new line, give Doc Co-authoring the item names, prices, and key details, and ask for structured description copy for each.
4. Ask Square to add the new items to the catalog once the copy is ready.
5. Ask Internal Comms to draft a short staff announcement about the new line, a price change, or a promo — ready to post wherever the team already looks.

## Why these pieces belong together

The kit is coherent because it follows the loop of an actual catalog update, not a pile of unrelated retail tools:

- Square holds **the real storefront** — what's for sale, what's in stock, what's been ordered.
- Doc Co-authoring turns new items into **copy customers can read**.
- Internal Comms turns the same change into **what staff need to know**.

Installed separately, the merchant checks the dashboard, writes copy from scratch in a doc editor, and tells the team by word of mouth or not at all. Installed together, the kit gives one path: **check the store → draft the copy for what's new → tell the team before customers ask**.

## Limits

- It does not process real payments, ship orders, or manage a warehouse — it reads and updates Square's catalog, orders, and inventory data; fulfillment and shipping happen outside this kit.
- Square's manifest defaults to sandbox mode; you must deliberately switch to production for the connector to act on your real store, and it acts with the same permissions your access token has.
- It does not publish the description copy anywhere — Doc Co-authoring drafts it, you paste it into your storefront, listing, or site.
- It does not send the staff announcement anywhere on its own — Internal Comms drafts it, you post or send it through whatever channel your team actually uses (this kit does not include a messaging connector).
- It is a storefront-operations kit, not accounting or tax software — for the books and financial reporting, use the Small Business Finance Kit instead.
