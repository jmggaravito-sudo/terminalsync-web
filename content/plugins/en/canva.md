---
name: Canva
logo: /plugins/canva.svg
category: marketing
status: available
tagline: "Designs that come out looking like your brand — the agent works from your brand sheet, in Canva."
description: "Bundles the official Canva connector (design generation, editing and export over OAuth) with Brand Guidelines (turns whatever brand material you have into a working brand sheet and applies it), so the social post, flyer or deck the agent produces uses your colors and tone instead of generic AI defaults."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: canva
skillSlugs: ["brand-guidelines"]
---
## When to use

- You produce customer-facing material yourself — social posts, flyers, promo images, a simple deck — and every Canva design starts from a template that looks like everyone else's.
- Your brand lives in a PDF nobody opens, a website, or your head: a couple of colors, a font, a tone. Nothing applies it consistently to what you make.
- You want the design produced and exported without opening Canva and clicking through it — but you don't want it to come out off-brand.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Canva (the connector)** is the official hosted Canva MCP server: with your own Canva login (no API key pasted anywhere), the agent generates designs, edits and finds them, works with your assets and brand material, and exports to PNG, PDF, JPG, PPTX or MP4. What it can do to a design matches your own access level to it.
- **Brand Guidelines (the skill)** takes whatever brand material you hand it — a guide, your website, past emails, a flyer you like — and builds a brand sheet first: colors with exact values, typography with a fallback, tone rules in plain words, an explicit do/don't list. Anything you didn't provide is marked "not defined" — it never invents a color or font and presents it as your brand.

**A real example:** you paste what you have about your brand and say *"generate this week's promo post in Canva, then export it as a PNG for the newsletter."* The skill fixes the brand sheet (and asks you to correct anything it read wrong); the connector generates the design in your Canva account, applies it, and hands you back the exported file. One job, one install — instead of a design brief that still ends with you clicking in Canva.

## How to use

1. Install the Plugin and connect Canva — no API key; you sign in with your own account in the browser.
2. Hand the skill whatever brand material you have. Review the brand sheet it returns first and correct the values it read wrong.
3. Ask for the artifact: *"a promo post for this week's discount"*, *"export last month's flyer as a PDF"*. The design lands in your Canva account, where you can keep editing it.

## Why the bundle works

The skill alone produces a brand sheet and applies it to text — but the design still has to be made by hand, and its own card says it doesn't see your logo files. The connector alone can generate designs all day, but every one of them comes out of a generic prompt, not from your brand. Together: the brand sheet is real input the agent designs against, and the asset and brand material in your Canva account is where your actual brand assets live — from "my brand is somewhere in a PDF" to "the exported PNG looks like us".

## Limits

- Some Canva features the agent would reach for are plan-gated: design resizing needs Canva Pro or better, and autofill templates and brand kits need Enterprise. On the free plan the agent works with what your account allows.
- The skill never invents brand values: anything you didn't give it stays marked as undefined instead of being filled with a generic default. The design can only be as on-brand as the material you hand it.
- A full brand identity is still a designer's job — a logo, packaging, or print production files are outside both pieces. The skill says so instead of faking it, and it cannot verify a font is licensed for your use.
- The connector is a server hosted by Canva (`mcp.canva.com`), not something that runs on your computer: each user authenticates individually, and what the agent can do is scoped to your own access level in Canva.
