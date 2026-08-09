---
name: SEO Content Kit
logo: /logos/ts-kit.svg
category: marketing
status: available
tagline: "Find what to write about, audit before you publish, draft the post, and put it live on WordPress — one content pipeline instead of four disconnected tools."
description: "A coherent content-marketing bundle for anyone running a business blog: pull real keyword and backlink data from Ahrefs, get an evidence-based SEO audit before publishing, co-write the post, and publish it straight to WordPress."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: ahrefs
    reason: "Surfaces real keyword rankings, backlink gaps, and content ideas from the account's own SEO data, so 'what should we write about?' is grounded in actual search demand instead of a guess."
  - kind: skill
    slug: seo-auditor
    reason: "Audits the target page or draft against on-page SEO blockers and high-impact fixes with evidence and a scored verdict, before the post goes live — not after traffic disappoints."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the keyword and audit findings into an actual structured blog post draft, written section by section, instead of a generic one-shot article."
  - kind: connector
    slug: wordpress
    reason: "Publishes the finished, reviewed post straight to the site, so the research and audit end in something live instead of a doc that never gets posted."
---
## Who it is for

A small-business owner, content marketer, or agency running a business blog on WordPress who wants each post to start from real search data instead of a guess, and to actually get published instead of sitting in a drafts folder.

Use it when the recurring job is "what should we write next, is it any good before it goes live, and can we just publish it" — not a full content calendar or enterprise CMS workflow.

## What it helps you do

This kit covers the full research-to-published loop of content marketing:

- Find real keyword ideas, ranking gaps, and backlink opportunities with Ahrefs.
- Draft a structured blog post from those findings with Doc Co-authoring.
- Audit the draft or the page it will live on for on-page SEO blockers with SEO Auditor, and get a scored verdict before publishing.
- Publish the reviewed post straight to WordPress.

The expected outcome is a blog post that started from real search demand, passed an evidence-based SEO check, and is live on the site — without juggling a keyword tool, a doc editor, an audit checklist, and the WordPress dashboard as four separate steps.

## What's included

### Connectors

- **Ahrefs** — reads keyword rankings, backlinks, referring domains, and keyword ideas from the account's own SEO data. It belongs here because deciding what to write about should start from real search demand, not intuition.
- **WordPress** — drafts and publishes posts and pages to the site. It belongs here because a content kit that stops at "here's a draft" leaves the actual publishing step undone; this connector closes the loop.

### Skills

- **SEO Auditor** — turns a URL or page data into a prioritized, evidence-backed audit with a 0–100 verdict. It belongs here because a post should clear on-page SEO blockers before it goes live, not get audited after it underperforms.
- **Doc Co-authoring** — builds the post section by section from the keyword research and audit findings, with revision passes instead of a single unreviewable draft. It belongs here because a blog post is a structured document, not a one-shot generation.

### CLI

No CLI tool is included. The target user is often non-technical, and the research → audit → draft → publish workflow does not require terminal execution.

## How to use it

1. Install the kit, connect Ahrefs with an `AHREFS_API_KEY`, and connect WordPress with your site URL, username, and an Application Password.
2. Ask *"what keywords are we missing that our competitors rank for?"* or *"what are people searching that we could write about?"* — Ahrefs answers.
3. Pick an angle and ask Doc Co-authoring for an outline first, then draft the post section by section.
4. Before publishing, ask SEO Auditor to audit the draft or the live URL it will replace, and get the blockers, high-impact fixes, and scored verdict.
5. Fix what the audit flags, then ask WordPress to save it as a draft on the site — or publish it once you've reviewed the final version.

## Why these pieces belong together

The kit is coherent because it follows one real content pipeline, not four unrelated marketing tools:

- Ahrefs supplies **what to write about**, grounded in real keyword and backlink data.
- Doc Co-authoring supplies **the actual post**, built with a real drafting process instead of a single generic pass.
- SEO Auditor supplies **the check before it goes live** — evidence, priorities, and a verdict, not a guess about whether it's ready.
- WordPress supplies **the finish line** — the post actually lands on the site.

Installed separately, the user researches keywords in one tool, drafts in another, has no structured way to audit before publishing, and still has to log into WordPress by hand. Installed together, the kit gives one path: **find the keyword gap → draft the post → audit it → publish it**.

It does not overlap with the Marketing Campaign & SEO Kit or the Social & Ad Creative Studio: those are built around paid social (Meta ads) and visual ad creative, with SEO limited to an audit step and no keyword tool or publishing connector. This kit is scoped specifically to organic written content — the research-to-published blog pipeline — and is the only kit in the catalog that can actually put a post live.

## Limits

- It does not guarantee rankings, traffic, or conversions — Ahrefs and SEO Auditor report on evidence and likely impact, not outcomes.
- The Ahrefs API is a paid add-on to an Ahrefs subscription; you need API access enabled on your account, separate from a base Ahrefs plan.
- WordPress publishing requires your own site with REST API access and an Application Password; publishing is gated behind a confirmation step, and the kit never posts without your review.
- SEO Auditor can only inspect what it's given or can access — private analytics, Search Console, JavaScript-rendered pages, and server logs need to be supplied separately for a complete audit.
- It does not manage a content calendar, assign writers, or handle multi-author approval workflows — it is a single-post research-to-publish pipeline, not a CMS or editorial platform.
- If your site does not run on WordPress, the research and drafting steps still work, but you would need to publish manually or use a different kit for the publishing step.
