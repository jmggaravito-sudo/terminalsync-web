---
name: Meta Ads
logo: /plugins/meta-ads.svg
category: marketing
status: available
tagline: "Write the ad batch, then watch how it performs — the agent does both."
description: "Bundles the Meta Ads connector (reads spend, results, and campaigns, read-only) with Meta Ads Creator (drafts five distinct Facebook/Instagram ad ideas with copy and a test plan), so you check your account before drafting more and check it again after you launch."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: meta-ads
skillSlugs: ["meta-ads-creator"]
---
## When to use

- You want fresh Facebook/Instagram ad ideas ready to test, and you also want to know how your current campaigns are doing — without switching between a copywriting doc and Ads Manager.
- You run your own ads for a small business and want the creative batch and the performance check in the same place.
- You want the agent to tell you what's already working before it hands you five more ideas to test.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Meta Ads (the connector)** reads your ad accounts, campaigns, and insights — spend, impressions, clicks, CTR, CPC, CPM, reach — **read-only**, so it never touches your campaigns.
- **Meta Ads Creator (the skill)** turns what you sell into five distinct ad ideas with copy, image direction, and formats, plus a plan for which to test first — and always closes with a scored verdict, never invented sales numbers.

**A real example:** you want new ad ideas, but you're not sure it's the right week to add another test — one campaign might already be spending fast. You say *"check how my active campaigns are doing this week, and if there's room, give me 5 new ad ideas for my spring sale"*. The connector reports spend and CTR per campaign so you see there's budget room, then Meta Ads Creator drafts five distinct ideas with copy, image direction, and a test plan, closing with a 🟢/🟡/🔴 verdict on which to try first.

## How to use

1. Install the Plugin and connect your Meta Ads account (paste your access token with `ads_read` at Settings → Integrations → Meta Ads).
2. Ask: *"how are my campaigns doing this week?"* — the connector reads spend and results.
3. Ask: *"give me 5 Meta ad ideas for [your offer]"* — the skill drafts the batch with a verdict.
4. Launch the winner in Ads Manager yourself, then come back and ask the connector how it did.

## Why the bundle works

The creator skill alone doesn't know what's already spending or working in your account, so it drafts blind. The connector alone shows you numbers but doesn't turn them into a new batch of ads to test. Together: the agent checks your real performance before recommending more spend, drafts ideas informed by that context, and later reads how the test actually did — a loop, not a one-off.

## Limits

- **Read-only**: it never publishes, edits, or pauses your ads — you launch and manage creative inside Ads Manager yourself.
- It doesn't guarantee sales, ROAS, or CPA — the skill's verdict is a readiness score for the creative, not a market promise.
- Requires connecting a Meta access token with `ads_read`; a one-click "Connect with Facebook" flow is on the way, for now it's a token paste.
