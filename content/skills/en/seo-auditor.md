---
name: SEO Auditor
logo: /skills/seo-auditor.svg
category: marketing
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "SEO audit with evidence and limits"
description: "Audits a URL or supplied page data, prioritizes SEO issues by likely impact, and states evidence, access limits, and uncertainty before making ranking claims."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You have a URL, page export, crawl data, Search Console data, or HTML and want an SEO audit ordered by likely impact.
- You suspect indexing, canonical, robots, sitemap, metadata, heading, structured data, internal linking, or performance issues.
- You want a practical action list instead of a generic SEO checklist.
- You can provide enough access for inspection: a public URL, rendered HTML, screenshots, crawl output, or relevant analytics/search data.

If no URL or page data is available, the skill should ask for it or clearly state that it can only give a planning checklist. It must not claim a page will rank, traffic will increase, or revenue will improve without evidence and follow-up measurement.

## What it does

Produces a prioritized SEO audit with:

- **Access note**: what was inspected, what could not be inspected, and what data would strengthen the audit.
- **Blockers first**: noindex, robots blocks, bad canonical tags, broken redirects, missing indexable content, major crawl failures.
- **High-impact fixes**: title/H1 mismatch, duplicate metadata, weak intent match, missing schema, poor internal links, slow critical pages, thin content.
- **Lower-priority improvements**: alt text, meta description polish, sitemap hygiene, small content gaps.
- **Evidence per issue**: observed symptom, likely user/search impact, exact fix, owner, and rough effort.
- **Claim limits**: distinguishes verified findings from hypotheses and avoids ranking guarantees.

It can inspect only what the model or connected tools can access. If JavaScript rendering, authenticated pages, Search Console, server logs, or Lighthouse data are unavailable, it must say so.

## How to use

1. Provide the target URL and the business goal: *"Audit https://example.com/pricing for demo signups and SEO intent."*
2. Add target country/language, priority keywords, competitors, CMS, and whether the page is public or gated.
3. If the assistant cannot browse, paste the rendered HTML, screenshots, crawl output, Lighthouse report, or Search Console excerpts.
4. Ask for findings grouped as blockers, high impact, and lower priority, with evidence and caveats.
5. Treat the recommendations as hypotheses until Search Console, crawl, analytics, or ranking data confirms the effect.

## Best for

Founders, marketers, content teams, and agencies that need a fast first-pass SEO audit with clear priorities and honest limits. Best for public URLs or pages where the user can supply crawl/search evidence; weaker for private apps, JavaScript-heavy pages without rendered HTML, or markets where keyword data is missing.
