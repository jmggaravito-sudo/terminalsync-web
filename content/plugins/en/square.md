---
name: Square
logo: /plugins/square.svg
category: marketing
status: available
tagline: "The customers who just came back — asked for a review the same week, not three months later."
description: "Bundles the Square connector (official, published by Block: payments, orders, customers, loyalty) with Ask for Reviews (spots the customers most likely to say something good and writes the ask for email, WhatsApp, or SMS), so the review request goes out while the good experience is still fresh."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: square
skillSlugs: ["pedir-resenas"]
---
## When to use

- You take payments through Square, and public reviews — Google, a marketplace, your own site — are how new customers find you.
- You know the right people to ask are the ones who just had a good experience; you just never get around to asking them.
- You want the message written and the follow-up planned, and you want to pick who gets it instead of blasting everyone.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Square (the connector)** is the official server published by Block. It talks to Square's Connect API — payments, orders, customers, loyalty — so the agent can read who bought, who came back, and when.
- **Ask for Reviews (the skill)** picks the right moment (right after a completed order, a second purchase, a resolved issue — never at random), prioritizes recent and repeat customers, skips anyone with an open complaint, and writes the ask for email, WhatsApp, or SMS with your direct review link — plus exactly one polite follow-up.

**A real example:** Friday afternoon you ask *"which of my customers bought from me more than once in the last two months? Write them a review request for WhatsApp."* Square reads the order history and names the repeat customers; Ask for Reviews drafts a short, personal message with your review link and a single follow-up, and gives you a verdict on whether the targeting is tight enough to send. You send it from your own phone.

## How to use

1. Connect Square with your access token. The manifest ships in sandbox mode by default — switch it to production when you want it reading your real business.
2. Paste the direct link to wherever you want the review: Google, your marketplace page, or your site.
3. Ask: *"who are my repeat customers this quarter? Write the review request and one follow-up for WhatsApp."*
4. Review the message, make sure the link works, and send it from your own tool.

## Why the bundle works

Square knows who bought and who came back — it doesn't write the ask, and it has no opinion about who's worth asking. Ask for Reviews writes a good ask, but on its own it needs you to describe your customers from memory. Together, the connector supplies the "recently had a good experience" signal the skill is built to target, and the skill turns it into a message worth sending. It's the asking half of the same reputation loop the Google Business Plugin covers end to end — with Square as the source of who to ask.

## Limits

- You send the ask, from your own email/WhatsApp/SMS — the connector doesn't message your customers, and the skill never posts a review on anyone's behalf.
- This plugin only needs to read, but Square's official server can also write (it exposes Square's full API, refunds included). Before switching to production, consider turning on its read-only option (`DISALLOW_WRITES`) so nothing but reading can happen.
- No incentives tied to a rating: it won't draft "leave us five stars and get 10% off," because most platforms forbid it and this won't help you break their rules.
- The connector ships sandboxed by default; in production your token acts on your real account, so treat it like a password.
- It doesn't promise how many reviews land. It targets the ask well; the customer still decides.
