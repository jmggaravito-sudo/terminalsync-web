---
name: Social & Ad Creative Studio Kit
logo: /logos/ts-kit.svg
category: marketing
status: available
tagline: "Plan the ad concept, then generate the image and the video for it — without hiring a studio."
description: "A creative-production bundle for business owners and marketers who need to turn one offer into a tested ad concept plus the actual image and video assets, instead of stopping at a text brief."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: meta-ads-creator
    reason: "Turns the offer, audience, and price into five distinct Meta ad concepts with copy, an image description, format, and a test plan — the creative direction the visuals below need before anything gets generated."
  - kind: connector
    slug: ideogram
    reason: "Generates the still image for each concept — the poster, product mockup, or feed image the ad copy describes — directly from the agent, using the account's own Ideogram login and credits."
  - kind: connector
    slug: higgsfield
    reason: "Generates the video/motion version of a concept for Stories, Reels, or a short UGC-style clip, extending the same creative direction into formats a still image cannot cover."
---
## Who it is for

Small business owners, local shops, independent professionals, and marketers who already have (or can write) an offer, but do not have a design studio or a video team to turn it into ad-ready visuals.

Use it when the job is not just "write ad copy" — it's "give me the concept, the image, and the video, ready to test."

## What it helps you do

This kit covers the concept-to-asset gap in ad creative:

- Turn an offer into five distinct Meta ad concepts with copy, format, and a test plan (Meta Ads Creator).
- Generate the still image each concept describes — product shots, posters, mockups — with Ideogram.
- Generate a short video or motion version of a concept — UGC-style clips, Reels-ready pieces — with Higgsfield.

The expected outcome is a small set of ad concepts that already have their copy, a real image, and a short video attached, ready for the owner to review and load into Meta Ads Manager for testing.

## What's included

### Skills

- **Meta Ads Creator** — builds five Meta ad concepts (Facebook + Instagram) with copy, button, an image description, format, and a test plan, always closing with a readiness verdict. It belongs here because it is the concept layer: the image and video connectors need a specific creative direction to generate against, not a blank prompt.

### Connectors

- **Ideogram** — an official, OAuth-connected image generation studio. It belongs here because it turns the "how the image looks" description from Meta Ads Creator into an actual visual the owner can review, remix, or reuse across formats.
- **Higgsfield** — an official, OAuth-connected image/video generation service (30+ models, videos up to 15 seconds). It belongs here because Meta's best-performing formats (Stories, Reels) are video-first, and a still-image tool alone cannot produce that asset.

### CLI

No CLI tool is included. The target user is a non-technical business owner, and the core workflow does not require terminal execution.

## How to use it

1. Install the kit and connect Ideogram and Higgsfield — both use your existing account login in the browser, no API key to paste.
2. Give Meta Ads Creator your offer: what you sell, at what price, to whom, in what area, and what action you want (message, buy, book).
3. Ask for the batch of 5 Meta ad concepts with copy, image description, format, and test plan.
4. Pick the strongest 1–2 concepts and ask Ideogram to generate the still image using the concept's image description.
5. For a Stories/Reels concept, ask Higgsfield to generate a short video version using the same creative direction.
6. Review the copy, image, and video together before loading them into Meta Ads Manager to test.

## Why these pieces belong together

The kit is coherent because it follows one production line, not three unrelated tools:

- Meta Ads Creator decides **what the ad should say and look like** — the creative brief.
- Ideogram turns that brief into **the actual still image**.
- Higgsfield turns the same brief into **the actual video**, for the formats a still image cannot serve.

Installed separately, the owner has a text brief and has to go find (or pay for) someone to actually make the image and video. Installed together, the kit gives one path: **concept -> image -> video**, all from the same creative direction, ready to test.

Zapier and NotebookLM were considered for this bundle and left out on purpose (see the run note): Zapier's MCP has no fixed install manifest — the user manages tools/URLs entirely on their own Zapier dashboard, so it does not meet the kit's "installable" bar — and NotebookLM has no installable connector in the catalog yet. Neither belongs in this kit until that changes.

## Limits

- It does not publish, schedule, or run the ad — the owner still reviews and loads the copy/image/video into Meta Ads Manager.
- It does not guarantee ROAS, CPA, reach, or sales from any concept, image, or video produced.
- Ideogram and Higgsfield generation draws on each account's own plan/credits, and video generation (Higgsfield) can take longer than an image and run asynchronously.
- It does not do full video editing (multi-clip timelines, sound design) — Higgsfield produces a generated clip, not a post-production pipeline.
- Human review is required before spending on ads, especially for claims about pricing, availability, or regulated categories.
