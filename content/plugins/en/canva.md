---
name: Canva
logo: /plugins/canva.svg
category: marketing
status: available
tagline: "Designs that look like your company, because the brand rules were set first."
description: "Bundles the Canva connector (official Canva MCP: generate, edit and export designs with your own Canva login) with Brand Guidelines (turns whatever brand material you have into a working brand sheet and applies it), so the design your agent produces starts from your colors, typography and tone instead of generic AI defaults."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: canva
skillSlugs: ["brand-guidelines"]
---
## When to use

- You make your own social posts, flyers and decks in Canva, and the results look "fine" but generic — nobody can tell they came from your company.
- Your brand exists somewhere (a PDF guide, your website, past posts) but nothing applies it consistently when a design needs to go out today.
- You want the brand decided before the design exists — exact colors, a typography with fallback, tone rules and a do/don't list — instead of correcting the agent's guesses after the fact.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Canva (the connector)** is the official hosted Canva MCP: with your own Canva login (no API key to paste), the agent generates, edits, finds and exports your designs — social posts, flyers, presentations — and works against your account's brand assets and folders. What it can do to a design matches your own access level in Canva.
- **Brand Guidelines (the skill)** builds the brand sheet first: colors with their exact values, typography with a fallback, tone rules in plain words, and an explicit do/don't list — built from the material you give it, never invented. Missing values are marked "not defined" instead of guessed. Then it applies those values to the artifact and drift-checks drafts, pointing at the exact element that leaves the brand.

**A real example:** *"Design a flyer for Saturday's promo using my brand sheet — export it as a PNG."* The skill hands over the sheet it built from your material (and corrects it when you fix a value); the connector makes the design in Canva with those values and returns the export — no transcribing hex codes into a design tool.

## How to use

1. Install the Plugin and connect Canva — no API key; a browser window opens, you log in with your own Canva account and approve access.
2. Hand the skill whatever shows your brand: the guide text, your site, past posts. Correct the brand sheet it returns ("the gray is #6B7280, not that one") — that correction sticks.
3. Ask for the design: "a social post for this week's promo using my brand sheet." Review it in Canva, then export it in the format you need.
4. Reuse "using my brand sheet" in later tasks so every new design starts from the same conventions.

## Why the bundle works

The skill alone produces a brand sheet you then have to apply by hand inside Canva; the connector alone makes whatever design you ask for — in whatever colors the prompt implies. Together: the values are decided and corrected before the design exists, and the design is made where your assets already live. No re-briefing the brand every time.

## Limits

- The brand sheet comes from the material you provide. The skill never picks a color or font and presents it as your brand, and it cannot see your logo files, verify font licensing, or produce print production specs — it says so when a job needs a real designer.
- Canva's features are plan-gated, per Canva's own docs: design resizing needs Canva Pro or higher, and Brand Kits / autofill templates need Enterprise. The skill's brand sheet works regardless of plan, but it is not the same thing as Canva's Enterprise Brand Kit.
- This is a server hosted by Canva, not something that runs on your computer: what the agent can see and do is bounded by your own Canva access level, and each user authenticates individually.
