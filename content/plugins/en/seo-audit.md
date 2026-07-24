---
name: SEO Audit
logo: /plugins/seo-audit.svg
category: marketing
status: available
tagline: "Actually audit your site — the skill that analyzes SEO + the tool that fetches your pages."
description: "A pack that bundles the SEO Auditor (analyzes and prioritizes issues with evidence) with Firecrawl (fetches your site's real content), so the audit doesn't depend on you pasting each page's HTML by hand."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: firecrawl
skillSlugs: ["seo-auditor"]
---
## When to use

- You want an SEO audit of your site **without** copy-pasting each page's HTML by hand.
- You have a public URL and want issues ordered by impact, with evidence and a clear verdict on where to start.
- You're a business owner or marketer and want an honest first pass — not a generic checklist or ranking promises.

## What it does

Bundles two pieces that reinforce each other, in one install:

- **Firecrawl (the connector)** fetches your pages' clean content so the analysis works on what your site actually shows — including rendered content, not just raw HTML.
- **SEO Auditor (the skill)** analyzes it and returns blockers first, high-impact fixes, evidence per finding, and a **scored verdict** (🟢/🟡/🔴) with the single highest-impact fix to start with — **no ranking guarantees**.

**A real example:** your "pricing" landing page isn't converting. You say *"audit the SEO of mysite.com/pricing"*. Firecrawl fetches the page, the SEO Auditor spots that the `title` doesn't match the `H1`, that product schema is missing, and that the meta description is duplicated with the home page, and gives a 🟡 62/100 verdict with "fix the title/H1 first" as the next step. You know exactly what to touch.

## How to use

1. Install the Plugin and connect **Firecrawl** with its API key.
2. Ask: *"audit the SEO of my site https://mysite.com"* (or a specific page).
3. Firecrawl fetches the pages; the SEO Auditor reviews them.
4. You get prioritized fixes, evidence, and the verdict — ready to act on.

## Why the bundle works

Installed separately, you'd have to know the SEO Auditor **needs** to see your pages to work well, and go find a tool to fetch them. The Plugin solves that: the skill that analyzes and the tool that gets the material come together and already wired. It's the difference between *"paste me each page's HTML"* and *"audit my site"*.

## Limits

- It can only audit what Firecrawl can reach: public pages yes; login-gated areas, private analytics, or Search Console need separate access.
- It doesn't guarantee rankings, traffic, or revenue — the verdict is the model's read of what it saw, not a promise. Changes are validated by measuring afterward.
- Firecrawl needs its API key and is subject to your plan's limits.
