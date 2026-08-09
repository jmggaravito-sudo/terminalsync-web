---
name: Meta Ads
logo: /connectors/meta-ads.svg
category: marketing
status: available
tagline: "See what's underperforming — and get fresh ad ideas to test, in one product."
description: "Bundles the Meta Ads connector (read-only spend, results, and campaign performance from Facebook & Instagram) with Meta Ads Creator (turns what you sell into several distinct ad ideas ready to test), so 'this campaign is tired' turns into new creative to try — without opening Ads Manager or hiring an agency."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: meta-ads
skillSlugs: ["meta-ads-creator"]
---
## When to use

- You run Facebook or Instagram ads and want to see which campaign is underperforming without opening Ads Manager.
- Once you spot the tired one, you want several fresh ad ideas — not just one guess — ready to test.
- You want a simple test plan for which idea to try first, without an agency and without invented results.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Meta Ads (the connector)** reads your spend, results, and per-campaign performance — CTR, cost per click, reach — read-only, so it can't touch your live campaigns.
- **Meta Ads Creator (the skill)** turns what you sell into five distinct ad ideas, each with copy, the button, how the image looks, and a plan for which to test first.

**A real example:** you want to know if your ads are still working before spending more. You say *"how is each active campaign doing this week?"*. Meta Ads reads the numbers and shows one campaign's CTR has been dropping for two weeks. You say *"give me 5 new ad ideas to test replacing it — I sell handmade candles, in Bogotá, mid-range price"*. Meta Ads Creator writes five distinct concepts with copy and a test plan. You pick two to launch in Ads Manager.

## How to use

1. Install the Plugin and connect Meta Ads with an access token that has `ads_read` permission.
2. Ask: *"how much did I spend this week and how is each campaign doing?"*.
3. Ask: *"give me 5 ad ideas to test for [what you sell], in [city], for [audience]"* — pick which to launch.

## Why the bundle works

The insights connector alone tells you a campaign is fading, but not what to try next. The creator skill alone writes ad ideas, but doesn't know which of your campaigns actually needs replacing. Together: Meta Ads points at what's tired, and Meta Ads Creator hands you the next ideas to test — a full loop from "is this working?" to "here's what to try instead", without switching tools.

## Limits

- Meta Ads is **read-only** — it never pauses, edits, or launches a campaign; you do that in Ads Manager.
- Meta Ads Creator doesn't promise results — it hands you distinct ideas and a way to test them, not a guaranteed winner.
- It doesn't guess your audience or price: it needs you to share what you sell, where, to whom, and at what price.
- Requires a Meta access token with `ads_read`; it only sees the ad accounts that token can reach.
